'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import React from "react";
import ScheduleScoreDetails from "./ScheduleScoreDetails";

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
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-200 w-full max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-green-700">Edit Schedule</h2>
              <div className="overflow-x-visible">
                <table ref={tableRef} className="min-w-full w-full border border-gray-200 rounded-lg text-sm">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-2 py-1 min-w-[90px]">Course Subject</th>
                      <th className="px-2 py-1 min-w-[90px]">Course Code</th>
                      <th className="px-2 py-1 min-w-[90px]">Course Type</th>
                      <th className="px-2 py-1 min-w-[120px]">Course Days</th>
                      <th className="px-2 py-1 min-w-[140px]">Course Time</th>
                      <th className="px-2 py-1 min-w-[120px]">Course Location</th>
                      <th className="px-2 py-1 min-w-[140px]">Instructor Name</th>
                      <th className="px-2 py-1 min-w-[70px]">Credits</th>
                      <th className="px-2 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2"
                            value={row.courseSubject}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseSubject = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="e.g. CS"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2"
                            value={row.courseCode}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseCode = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="e.g. 101"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2"
                            value={row.courseType}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseType = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="e.g. Lecture"
                          />
                        </td>
                        <td className="px-2 py-1 relative min-w-[120px]">
                          <div className="relative">
                            <button
                              type="button"
                              className="w-full border rounded-md p-1 text-left bg-white hover:bg-cyan-50 flex flex-wrap gap-1 min-h-[36px]"
                              onClick={() => setOpenDaysDropdown(openDaysDropdown === idx ? null : idx)}
                            >
                              {row.courseDays.length > 0 ? (
                                row.courseDays.map(day => (
                                  <span key={day} className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold border border-cyan-300 mr-1 mb-1">
                                    {dayAbbr[day]}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">Select Days</span>
                              )}
                              <svg className="w-4 h-4 ml-auto text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {openDaysDropdown === idx && (
                              <div className="absolute left-0 top-10 z-30 bg-white border border-cyan-200 shadow-xl rounded-lg p-2 max-w-xs min-w-[160px] w-44 overflow-hidden" style={{ right: 0 }}>
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                  <label key={day} className="flex items-center py-1 px-2 rounded hover:bg-cyan-50 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={row.courseDays.includes(day)}
                                      onChange={e => {
                                        const newSchedule = [...schedule];
                                        if (e.target.checked) {
                                          newSchedule[idx].courseDays = [...row.courseDays, day];
                                        } else {
                                          newSchedule[idx].courseDays = row.courseDays.filter(d => d !== day);
                                        }
                                        setSchedule(newSchedule);
                                      }}
                                      className="mr-2 accent-cyan-500"
                                    />
                                    <span className="text-gray-700 text-sm">{day}</span>
                                    {row.courseDays.includes(day) && (
                                      <svg className="w-4 h-4 ml-1 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    )}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1 flex gap-2 items-center">
                          <input
                            type="time"
                            className="border rounded-md p-2 w-24"
                            value={row.courseTime.start}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseTime.start = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="Start"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            className="border rounded-md p-2 w-24"
                            value={row.courseTime.end}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseTime.end = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="End"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2"
                            value={row.courseLocation}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseLocation = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="e.g. WALC 101"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2"
                            value={row.instructorName}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].instructorName = e.target.value;
                              setSchedule(newSchedule);
                            }}
                            placeholder="e.g. Dr. Smith"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            className="w-full border rounded-md p-2"
                            value={row.credits}
                            onChange={e => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].credits = e.target.value.replace(/[^0-9]/g, '');
                              setSchedule(newSchedule);
                            }}
                            placeholder="e.g. 3"
                          />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <button
                            className="text-red-500 hover:text-red-700 font-bold px-2"
                            onClick={() => {
                              setSchedule(schedule.filter((_, i) => i !== idx));
                            }}
                            aria-label="Delete row"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
                onClick={() => setSchedule([...schedule, initialScheduleRow])}
              >
                + Add Class
              </button>
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
                    <label className="text-lg font-medium text-gray-700">RMP Rating</label>
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
                  <p className="text-sm text-gray-500 mb-2">Based on student reviews from RateMyProfessor.com, this score reflects professor quality, clarity, helpfulness, and teaching style.</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700">Boiler Grades</label>
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
                  <p className="text-sm text-gray-500 mb-2">Reflects the average GPA students have earned in these class over recent semesters.</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700">Hecticness</label>
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
                  <p className="text-sm text-gray-500 mb-2">Reflects how evenly (or unevenly) your classes are spread out — the more bunched up, the higher the hecticness.</p>
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
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-200">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
