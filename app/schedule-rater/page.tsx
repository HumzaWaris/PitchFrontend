'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import React from "react";
import ScheduleScoreDetails from "./ScheduleScoreDetails";
import locations from '../lib/locations.json';

type RmpComment = {
  qualityRating: number;
  difficulty: number;
  wouldTakeAgain: number | null;
};
type BoilergradesData = {
  average_gpa: number;
  used_course_avg: boolean;
};
type CommentsSummary = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
};
type CourseData = {
  boilergrades_data?: BoilergradesData;
  rmp_comments?: RmpComment[];
  comments_summary?: CommentsSummary;
};

type ScheduleRaterJson = {
  [course: string]: CourseData | number;
  hecticness_final_score: number;
  boilergrades_final_score: number;
  rmp_final_score: number;
  final_score: number;
};

type ScheduleRow = {
  courseSubject: string;
  courseCode: string;
  courseType: string;
  courseDays: string[];
  courseTime: { start: string; end: string };
  courseLocation: string;
  instructorName: string;
  credits: string;
};

function parseScheduleRaterJson(data: ScheduleRaterJson) {
  // Extract scores
  const finalScore = data.final_score;
  const hecticnessScore = data.hecticness_final_score;
  const boilergradesScore = data.boilergrades_final_score;
  const rmpScore = data.rmp_final_score;

  // Filter out only course entries (ignore the score keys)
  const courseEntries = Object.entries(data).filter(
    ([key, value]) =>
      typeof value === "object" &&
      value !== null &&
      !["hecticness_final_score", "boilergrades_final_score", "rmp_final_score", "final_score"].includes(key)
  ) as [string, CourseData][];

  // Class with lowest average GPA
  let lowestGpaCourse = null;
  let lowestGpa = Infinity;
  courseEntries.forEach(([course, courseData]) => {
    if (
      courseData.boilergrades_data &&
      typeof courseData.boilergrades_data.average_gpa === "number" &&
      courseData.boilergrades_data.average_gpa < lowestGpa
    ) {
      lowestGpa = courseData.boilergrades_data.average_gpa;
      lowestGpaCourse = course;
    }
  });

  // Class with lowest average RMP rating
  let lowestRmpCourse = null;
  let lowestRmp = Infinity;
  courseEntries.forEach(([course, courseData]) => {
    if (courseData.rmp_comments && courseData.rmp_comments.length > 0) {
      const avg = courseData.rmp_comments.reduce((sum, c) => sum + c.qualityRating, 0) / courseData.rmp_comments.length;
      if (avg < lowestRmp) {
        lowestRmp = avg;
        lowestRmpCourse = course;
      }
    }
  });

  // Most difficult class (highest avg difficulty)
  let hardestCourse = null;
  let highestDifficulty = -Infinity;
  courseEntries.forEach(([course, courseData]) => {
    if (courseData.rmp_comments && courseData.rmp_comments.length > 0) {
      const avg = courseData.rmp_comments.reduce((sum, c) => sum + c.difficulty, 0) / courseData.rmp_comments.length;
      if (avg > highestDifficulty) {
        highestDifficulty = avg;
        hardestCourse = course;
      }
    }
  });

  // Most loved class (% would take again)
  let mostLovedCourse = null;
  let highestWouldTakeAgain = -Infinity;
  courseEntries.forEach(([course, courseData]) => {
    if (courseData.rmp_comments && courseData.rmp_comments.length > 0) {
      const count = courseData.rmp_comments.filter((c) => c.wouldTakeAgain === 1).length;
      const percent = (count / courseData.rmp_comments.length) * 100;
      if (percent > highestWouldTakeAgain) {
        highestWouldTakeAgain = percent;
        mostLovedCourse = course;
      }
    }
  });

  // Class with most RMP reviews
  let mostReviewedCourse = null;
  let mostReviews = -Infinity;
  courseEntries.forEach(([course, courseData]) => {
    if (courseData.rmp_comments && courseData.rmp_comments.length > mostReviews) {
      mostReviews = courseData.rmp_comments.length;
      mostReviewedCourse = course;
    }
  });

  // Build allCourses array for strengths/weaknesses
  const allCourses = courseEntries.map(([course, courseData]) => ({
    courseName: course,
    strengths: courseData.comments_summary?.strengths || [],
    weaknesses: courseData.comments_summary?.weaknesses || [],
  }));

  // Add summaryCourse, summaryStrength, summaryWeakness (default to null)
  return {
    finalScore: Math.round(finalScore * 100) / 100,
    hecticnessScore: Math.round(hecticnessScore * 100) / 100,
    boilergradesScore: Math.round(boilergradesScore * 100) / 100,
    rmpScore: Math.round(rmpScore * 100) / 100,
    lowestGpaCourse,
    lowestGpa: lowestGpa !== Infinity ? Math.round(lowestGpa * 100) / 100 : null,
    lowestRmpCourse,
    lowestRmp: lowestRmp !== Infinity ? Math.round(lowestRmp * 100) / 100 : null,
    hardestCourse,
    highestDifficulty: highestDifficulty !== -Infinity ? Math.round(highestDifficulty * 100) / 100 : null,
    mostLovedCourse,
    highestWouldTakeAgain: highestWouldTakeAgain !== -Infinity ? Math.round(highestWouldTakeAgain) : null,
    mostReviewedCourse,
    mostReviews: mostReviews !== -Infinity ? mostReviews : null,
    summaryCourse: null,
    summaryStrength: null,
    summaryWeakness: null,
    allCourses,
  };
}

const mockJson = {
  "STAT 35000": { boilergrades_data: { average_gpa: 3.017, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "MGMT 29120": { boilergrades_data: { average_gpa: 3.899, used_course_avg: false }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "MGMT 20100": { boilergrades_data: { average_gpa: 3.291, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "ME 20000": { boilergrades_data: { average_gpa: 2.642, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "ME 27000": { boilergrades_data: { average_gpa: 2.75, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "MFET 16300": {
    boilergrades_data: { average_gpa: 3.546, used_course_avg: false },
    rmp_comments: [
      { qualityRating: 3, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 1, difficulty: 1, wouldTakeAgain: null },
      { qualityRating: 4, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 4, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 5, difficulty: 3, wouldTakeAgain: 1 },
      { qualityRating: 2, difficulty: 1, wouldTakeAgain: null },
      { qualityRating: 4, difficulty: 3, wouldTakeAgain: 1 },
      { qualityRating: 1, difficulty: 2, wouldTakeAgain: null },
      { qualityRating: 1, difficulty: 3, wouldTakeAgain: null },
      { qualityRating: 3, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 5, difficulty: 3, wouldTakeAgain: 1 },
      { qualityRating: 3, difficulty: 1, wouldTakeAgain: 1 },
      { qualityRating: 3, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 1, difficulty: 2, wouldTakeAgain: null },
      { qualityRating: 1, difficulty: 3, wouldTakeAgain: null },
      { qualityRating: 5, difficulty: 3, wouldTakeAgain: 1 }
    ],
    comments_summary: {
      summary: "Professor Fuerst is perceived as a kind and approachable instructor who cares about his students and tries to improve the course.",
      strengths: ["Approachable and kind professor who is willing to help students during office hours."],
      weaknesses: ["Course is poorly organized with confusing assignments, buggy software, and unhelpful mandatory lectures."]
    }
  },
  "MA 26500": { boilergrades_data: { average_gpa: 2.63, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  hecticness_final_score: 0.6,
  boilergrades_final_score: 0.69,
  rmp_final_score: 0.43,
  final_score: 57.35
};

const parsed = parseScheduleRaterJson(mockJson);

type WeightageKey = 'rmp' | 'boilerGrades' | 'hecticness';

function calculateFinalScore(weightage: { rmp: number; boilerGrades: number; hecticness: number }, parsed: any) {
  const totalWeight = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
  if (totalWeight === 0) return 0;
  return (
    (parsed.rmpScore * weightage.rmp +
      parsed.boilergradesScore * weightage.boilerGrades +
      parsed.hecticnessScore * weightage.hecticness) /
    totalWeight
  ) * 10; // Scale to 10 for display
}

const loadingTips = [
  "Did you know? BoilerGrades uses real GPA data from past semesters!",
  "Tip: A balanced schedule can help reduce stress.",
  "Fun Fact: RMP scores are based on real student reviews!",
  "Hecticness measures how bunched up your classes are.",
  "You can edit your schedule after it's processed!",
  "Pro tip: Give more weight to what matters most to you!",
  "You can add, edit, or remove classes before scoring.",
  "BoilerGrades helps you spot grade trends in tough classes.",
  "RMP ratings reflect professor quality, clarity, and helpfulness.",
  "Hectic schedules can make your semester more stressful!",
  "Try different weightings to see how your score changes.",
  "All your data stays on your device—nothing is uploaded!"
];

// Add a mapping for day abbreviations
const dayAbbr: Record<string, string> = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'Th', Fri: 'F', Sat: 'Sa', Sun: 'Su' };

// Helper for time options
const timeOptions = Array.from({ length: 56 }, (_, i) => {
  const hour = Math.floor(i / 4) + 7;
  const min = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
});

// Helper for location search
type LocationDropdownProps = { value: string; onChange: (val: string) => void; inputClassName?: string };
function LocationDropdown({ value, onChange, inputClassName = '' }: LocationDropdownProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = Object.entries(locations).filter(([code, name]) =>
    `${code} - ${name}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="relative w-full">
      <input
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 text-xs sm:text-sm h-10 ${inputClassName}`}
        value={search || value}
        onFocus={() => setOpen(true)}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search location"
      />
      {open && (
        <div className="absolute z-40 bg-white border border-cyan-200 shadow-xl rounded-lg max-h-40 overflow-y-auto w-full">
          {filtered.length === 0 && <div className="p-2 text-gray-400">No results</div>}
          {filtered.map(([code, name]) => (
            <div
              key={code}
              className="px-3 py-2 hover:bg-cyan-50 cursor-pointer text-xs sm:text-sm"
              onClick={() => { onChange(`${code} - ${name}`); setSearch(''); setOpen(false); }}
            >
              {code} - {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper for days multi-select
const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type DaysDropdownProps = { value: string[]; onChange: (days: string[]) => void };
function DaysDropdown({ value, onChange, dropdownWidthClass = 'w-32' }: DaysDropdownProps & { dropdownWidthClass?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button
        type="button"
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-left bg-white hover:bg-cyan-50 flex justify-between items-center min-h-[48px] text-base"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex flex-wrap gap-1 items-center">
          {value.length > 0 ? (
            value.map((day: string) => (
              <span key={day} className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold border border-cyan-300 align-middle">
                {dayAbbr[day]}
              </span>
            ))
          ) : (
            <span className="text-gray-400">Days</span>
          )}
        </span>
        <span className="flex items-center justify-center h-full"><svg className="w-5 h-5 text-cyan-400 align-middle ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></span>
      </button>
      <div className={`absolute left-0 top-10 z-30 bg-white border border-cyan-200 shadow-xl rounded-lg p-2 min-w-[100px] ${dropdownWidthClass} overflow-hidden transition-all duration-200 ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`} style={{transformOrigin: 'top'}}>
        {open && (
          <div className="flex flex-col gap-1">
            {allDays.map((day: string) => (
              <label key={day} className="flex items-center py-1 px-2 rounded hover:bg-cyan-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(day)}
                  onChange={e => {
                    if (e.target.checked) onChange([...value, day]);
                    else onChange(value.filter((d: string) => d !== day));
                  }}
                  className="mr-2 accent-cyan-500"
                />
                <span className="text-gray-700 text-xs sm:text-sm">{day}</span>
                {value.includes(day) && (
                  <svg className="w-4 h-4 ml-1 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper for info icon with tooltip
type InfoIconProps = { text: string };
function InfoIcon({ text }: InfoIconProps) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative ml-1">
      <button
        type="button"
        className="text-cyan-500 hover:text-cyan-700 focus:outline-none"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        tabIndex={0}
      >
        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
      </button>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-cyan-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 z-50">
          {text}
        </div>
      )}
    </span>
  );
}

export default function ScheduleRater() {
  const [weightage, setWeightage] = useState({
    rmp: 33,
    boilerGrades: 33,
    hecticness: 34,
  });
  const [weightageError, setWeightageError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [scheduleUploaded, setScheduleUploaded] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const initialScheduleRow: ScheduleRow = {
    courseSubject: '',
    courseCode: '',
    courseType: '',
    courseDays: [],
    courseTime: { start: '', end: '' },
    courseLocation: '',
    instructorName: '',
    credits: ''
  };
  const [schedule, setSchedule] = useState<ScheduleRow[]>([initialScheduleRow]);
  const [showUpload, setShowUpload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [openDaysDropdown, setOpenDaysDropdown] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [openInfo, setOpenInfo] = useState<null | 'rmp' | 'boilerGrades' | 'hecticness'>(null);

  const handleWeightageChange = (category: WeightageKey, value: number) => {
    setWeightage(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let tipInterval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      setTipIndex(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 1 : 100));
      }, 100);
      tipInterval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [loading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setOpenDaysDropdown(null);
      }
    }
    if (openDaysDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDaysDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-cyan-300 to-blue-400 py-0 px-0">
      {/* Huddle Logo and nav */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <div className="flex items-center space-x-3">
          <Image src="/images/Huddle_Social_Icon_Transparent_Background.png" alt="Huddle Logo" width={48} height={48} />
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Huddle</span>
        </div>
        {/* Placeholder for nav links if needed */}
      </div>

      <div className="max-w-4xl mx-auto mt-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Schedule Rater</h1>
          <p className="text-lg text-gray-700">Upload your schedule — we'll score it using RateMyProfessor, BoilerGrades, and how hectic it looks.</p>
        </div>
        {scheduleGenerated && (
          <div className="mb-8">
            <button
              className="w-full border-2 border-red-600 text-red-600 bg-white py-3 px-6 rounded-xl text-lg font-bold hover:bg-red-50 transition mb-2"
              onClick={() => {
                setShowUpload(true);
                setScheduleGenerated(false);
                setScheduleUploaded(false);
                setSelectedFile(null);
                setSchedule([initialScheduleRow]);
                setFinalScore(null);
                setAnalysisOpen(false);
              }}
            >
              Do you want to use a new image?
            </button>
            <div className="text-center text-red-700 font-medium text-sm mt-1">
              Warning: Clicking this button will reset all progress and require a new reading of your schedule.
            </div>
          </div>
        )}
        {/* File Upload Section */}
        {showUpload && !scheduleGenerated && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-cyan-200">
            <h2 className="text-2xl font-semibold mb-6 text-cyan-700">Upload Schedule</h2>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-cyan-400 rounded-xl cursor-pointer bg-cyan-50 hover:bg-cyan-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-12 h-12 mb-4 text-cyan-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-lg text-cyan-700">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-cyan-500">PNG, JPG or JPEG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setScheduleUploaded(true);
                    }
                  }}
                />
              </label>
            </div>
            {scheduleUploaded && !scheduleGenerated && (
              <button
                className="mt-6 w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-500 hover:to-cyan-600 transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-cyan-200 shadow-md"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setScheduleGenerated(true);
                    setShowUpload(false);
                    setSchedule([
                      { courseSubject: 'CS', courseCode: '101', courseType: 'Lecture', courseDays: ['Mon', 'Wed', 'Fri'], courseTime: { start: '10:00', end: '10:50' }, courseLocation: 'WALC 101', instructorName: 'Dr. Smith', credits: '3' },
                      { courseSubject: 'MATH', courseCode: '201', courseType: 'Lecture', courseDays: ['Tue', 'Thu'], courseTime: { start: '11:00', end: '11:50' }, courseLocation: 'WALC 201', instructorName: 'Dr. Johnson', credits: '3' },
                      { courseSubject: 'ENG', courseCode: '101', courseType: 'Lecture', courseDays: ['Mon', 'Wed', 'Fri'], courseTime: { start: '12:00', end: '12:50' }, courseLocation: 'WALC 301', instructorName: 'Dr. Brown', credits: '3' }
                    ]);
                    setLoading(false);
                  }, 10000);
                }}
              >
                Generate Schedule
              </button>
            )}
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            {/* Fun animated icon */}
            <div className="mb-6 animate-bounce">
              <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="30" stroke="#06b6d4" strokeWidth="4" fill="#e0f2fe" />
                <path d="M32 20v16l12 6" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Progress bar */}
            <div className="w-64 h-4 bg-cyan-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-cyan-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Rotating tip */}
            <div className="text-lg font-semibold text-cyan-700 mb-2">Processing your schedule...</div>
            <div className="text-gray-500 mb-2">{loadingTips[tipIndex]}</div>
            <div className="text-gray-400 text-sm">This may take up to 10 seconds.</div>
          </div>
        )}

        {/* Schedule Editor Section */}
        {scheduleGenerated && (
          <>
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-green-200 w-full max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-green-700">Edit Schedule</h2>
                <span className="text-gray-500 text-sm">Add, edit, or remove your classes below. <span className='hidden sm:inline'>Hover over headers for help.</span></span>
              </div>
              {/* Table wrapper for horizontal scroll */}
              <div className="overflow-x-auto w-full">
                <div className="min-w-[1200px]">
                  <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-center w-full text-base mb-2">
                    <div className="col-span-1 font-semibold text-center flex justify-center items-center bg-green-50 py-2 rounded-tl-lg">Course Subject <span title='e.g. CS, MATH, ENG' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-1 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Course Code <span title='e.g. 101, 201' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-1 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Course Type <span title='e.g. Lecture, Lab' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-2 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Course Days <span title='Select all days this class meets' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-1.5 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Start Time <span title='Class start time' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-1.5 font-semibold text-center flex justify-center items-center bg-green-50 py-2">End Time <span title='Class end time' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-2 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Course Location <span title='e.g. WALC 101' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-2 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Instructor Name <span title='e.g. Dr. Smith' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-1 font-semibold text-center flex justify-center items-center bg-green-50 py-2">Credits <span title='Number of credits' className='cursor-help text-cyan-500 ml-1'>ℹ️</span></div>
                    <div className="col-span-1 font-semibold text-center flex justify-center items-center bg-green-50 py-2 rounded-tr-lg"></div>
                  </div>
                  {schedule.map((row, idx) => (
                    <div className={`grid grid-cols-12 gap-x-4 gap-y-2 items-center w-full mb-3 py-3 text-base ${idx % 2 === 1 ? 'bg-gray-50' : ''}`} key={idx}>
                      <div className="col-span-1 flex justify-center"><input type="text" className="w-full min-w-[70px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 transition" value={row.courseSubject} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseSubject = e.target.value; setSchedule(newSchedule); }} placeholder="CS" /></div>
                      <div className="col-span-1 flex justify-center"><input type="text" className="w-full min-w-[70px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 transition" value={row.courseCode} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseCode = e.target.value; setSchedule(newSchedule); }} placeholder="101" /></div>
                      <div className="col-span-1 flex justify-center"><input type="text" className="w-full min-w-[90px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 transition" value={row.courseType} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseType = e.target.value; setSchedule(newSchedule); }} placeholder="Lecture" /></div>
                      <div className="col-span-2 flex justify-center"><DaysDropdown value={row.courseDays} onChange={(days: string[]) => { const newSchedule = [...schedule]; newSchedule[idx].courseDays = days; setSchedule(newSchedule); }} dropdownWidthClass="w-28" /></div>
                      <div className="col-span-1.5 flex justify-center"><input type="time" className="w-full min-w-[100px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold" value={row.courseTime.start} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseTime.start = e.target.value; setSchedule(newSchedule); }} placeholder="Start" /></div>
                      <div className="col-span-1.5 flex justify-center"><input type="time" className="w-full min-w-[100px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold" value={row.courseTime.end} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseTime.end = e.target.value; setSchedule(newSchedule); }} placeholder="End" /></div>
                      <div className="col-span-2 flex justify-center"><LocationDropdown value={row.courseLocation} onChange={(loc: string) => { const newSchedule = [...schedule]; newSchedule[idx].courseLocation = loc; setSchedule(newSchedule); }} inputClassName="w-full min-w-[150px] h-12 px-3 py-2 overflow-x-auto resize-x" /></div>
                      <div className="col-span-2 flex justify-center"><input type="text" className="w-full min-w-[150px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 transition" value={row.instructorName} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].instructorName = e.target.value; setSchedule(newSchedule); }} placeholder="Dr. Smith" /></div>
                      <div className="col-span-1 flex justify-center"><input type="number" min="0" className="w-full min-w-[60px] h-12 border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 transition" value={row.credits} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].credits = e.target.value.replace(/[^0-9]/g, ''); setSchedule(newSchedule); }} placeholder="3" /></div>
                      <div className="col-span-1 flex justify-center items-center"><button className="text-red-500 hover:text-red-700 font-bold px-2 text-lg" onClick={() => { setSchedule(schedule.filter((_, i) => i !== idx)); }} aria-label="Delete row">✕</button></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center gap-2 shadow-sm"
                  onClick={() => setSchedule([...schedule, initialScheduleRow])}
                >
                  <span className="text-lg">＋</span> Add Class
                </button>
              </div>
              <div className="text-gray-400 text-xs mt-2 text-right">Tip: Double-click a field to edit. Hover over headers for more info.</div>
            </div>
            {/* Weightage Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Set Weightage</h2>
                <span className="text-lg font-semibold text-gray-700">Total: {weightage.rmp + weightage.boilerGrades + weightage.hecticness}/100</span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700 flex items-center">RMP Rating <InfoIcon text="Based on student reviews from RateMyProfessor.com, this score reflects professor quality, clarity, helpfulness, and teaching style." /></label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={weightage.rmp}
                        onChange={e => handleWeightageChange('rmp', Number(e.target.value))}
                        className="w-80 h-2 bg-cyan-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={weightage.rmp}
                        onChange={e => {
                          let val = Number(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          handleWeightageChange('rmp', val);
                        }}
                        className="w-16 border rounded-md p-1 text-center"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700 flex items-center">Boiler Grades <InfoIcon text="Reflects the average GPA students have earned in these class over recent semesters." /></label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={weightage.boilerGrades}
                        onChange={e => handleWeightageChange('boilerGrades', Number(e.target.value))}
                        className="w-80 h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={weightage.boilerGrades}
                        onChange={e => {
                          let val = Number(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          handleWeightageChange('boilerGrades', val);
                        }}
                        className="w-16 border rounded-md p-1 text-center"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700 flex items-center">Hecticness <InfoIcon text="Reflects how evenly (or unevenly) your classes are spread out — the more bunched up, the higher the hecticness." /></label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={weightage.hecticness}
                        onChange={e => handleWeightageChange('hecticness', Number(e.target.value))}
                        className="w-80 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={weightage.hecticness}
                        onChange={e => {
                          let val = Number(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          handleWeightageChange('hecticness', val);
                        }}
                        className="w-16 border rounded-md p-1 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="mt-8 w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-500 hover:to-cyan-600 transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-cyan-200 shadow-md"
                onClick={() => {
                  const sum = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
                  if (sum !== 100) {
                    setWeightageError("The sum of all weightages must be exactly 100.");
                  } else {
                    setWeightageError(null);
                    setFinalScore(calculateFinalScore(weightage, parsed));
                  }
                }}
              >
                Calculate Score
              </button>
              {weightageError && (
                <div className="mt-2 text-red-600 text-center font-semibold">{weightageError}</div>
              )}
            </div>
          </>
        )}

        {/* Score Display */}
        {finalScore !== null && (
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-cyan-200 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-cyan-700">Your Schedule Score</h2>
            <div className="text-6xl font-bold text-center text-cyan-500 mb-4">
              {finalScore.toFixed(2)}/10
            </div>
            <button
              className="flex items-center mx-auto px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg font-semibold hover:bg-cyan-200 transition mb-2"
              onClick={() => setAnalysisOpen((open) => !open)}
              aria-expanded={analysisOpen}
              aria-controls="schedule-analysis-dropdown"
            >
              {analysisOpen ? 'Hide' : 'Show'} Schedule Analysis
              <span className="ml-2">{analysisOpen ? '▲' : '▼'}</span>
            </button>
            {analysisOpen && (
              <div id="schedule-analysis-dropdown">
                <ScheduleScoreDetails data={parsed} />
                {/* Daily Hecticness Explanation */}
                <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 rounded-2xl border border-blue-200 shadow-lg max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /><circle cx="12" cy="12" r="10" /></svg>
                    Why is each day hectic or easy?
                  </h3>
                  <ul className="space-y-3 text-gray-800">
                    <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg></span><span><span className="font-semibold">Monday:</span> Insufficient free time for lunch (only 40 min free during lunch). Back-to-back classes (gap 10 min) from CS 25000 in WALC to WGSS 28000 in SCHM and from STAT 35500 in WTHR to CS 25100 in LILY.</span></li>
                    <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg></span><span><span className="font-semibold">Wednesday:</span> Insufficient free time for lunch (only 40 min free during lunch). Back-to-back classes (gap 10 min) from CS 25000 in LWSN to CS 25000 in WALC, from CS 25000 in WALC to WGSS 28000 in SCHM, and from STAT 35500 in WTHR to CS 25100 in LILY.</span></li>
                    <li className="flex items-start gap-2"><span className="mt-1"><svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z" /></svg></span><span><span className="font-semibold">Friday:</span> Insufficient free time for lunch (only 40 min free during lunch). Back-to-back classes (gap 10 min) from CS 25000 in WALC to WGSS 28000 in SCHM, from CS 25100 in HAMP to STAT 35500 in WTHR, and from STAT 35500 in WTHR to CS 25100 in LILY.</span></li>
                  </ul>
                  <div className="mt-4 text-gray-600 text-sm flex items-center gap-2"><svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7h2v2h-2v-2zm0-4h2v2h-2V7z" /></svg>Days not listed above are less hectic, with longer breaks and more free time between classes.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
