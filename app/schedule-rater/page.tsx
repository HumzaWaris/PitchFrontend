'use client';

// Lolitos

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import React from "react";
import ScheduleScoreDetails from "./ScheduleScoreDetails";
import { createPortal } from 'react-dom';
import locationsData from '../../locations.json';

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
  willAttend?: boolean;
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
  "STAT 35000": { instructorName: "Dr. Lee", boilergrades_data: { average_gpa: 3.017, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "MGMT 29120": { instructorName: "Prof. Patel", boilergrades_data: { average_gpa: 3.899, used_course_avg: false }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "MGMT 20100": { instructorName: "Dr. Smith", boilergrades_data: { average_gpa: 3.291, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "ME 20000": { instructorName: "Dr. Johnson", boilergrades_data: { average_gpa: 2.642, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "ME 27000": { instructorName: "Prof. Chen", boilergrades_data: { average_gpa: 2.75, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
  "MFET 16300": {
    instructorName: "Dr. Fuerst",
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
  "MA 26500": { instructorName: "Dr. Green", boilergrades_data: { average_gpa: 2.63, used_course_avg: true }, rmp_comments: [], comments_summary: { summary: "No comments to summarize.", strengths: [], weaknesses: [] } },
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
type LocationDropdownProps = { value: string; onChange: (val: string) => void; inputClassName?: string; open: boolean; setOpen: (open: boolean) => void; inputRef: React.RefObject<HTMLInputElement> };
function LocationDropdown({ value, onChange, inputClassName = '', open, setOpen, inputRef }: LocationDropdownProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Use locations from the imported JSON
  const locations = Object.entries(locationsData).map(([abbr, name]) => `${abbr} - ${name}`);
  const filtered = locations.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  // --- Portal logic ---
  useEffect(() => {
    if (!open || !inputRef.current) return;
    function updateDropdownPos() {
      const rect = inputRef.current!.getBoundingClientRect();
      setDropdownPos({ left: rect.left, top: rect.bottom + window.scrollY, width: rect.width });
    }
    updateDropdownPos();
    window.addEventListener('scroll', updateDropdownPos, true);
    window.addEventListener('resize', updateDropdownPos);
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, true);
      window.removeEventListener('resize', updateDropdownPos);
    };
  }, [open, inputRef]);

  useEffect(() => {
    if (open && highlighted >= 0 && highlighted < filtered.length) {
      const el = document.getElementById(`location-option-${highlighted}`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, open, filtered.length]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      const inputEl = inputRef?.current;
      const dropdownEl = dropdownRef.current;
      if (
        inputEl && !inputEl.contains(e.target as Node) &&
        dropdownEl && !dropdownEl.contains(e.target as Node)
      ) {
        setOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open, setOpen, inputRef]);

  // Handle option selection
  const handleSelect = (name: string) => {
    onChange(name);
    setSearch('');
    setOpen(false);
    setIsFocused(false);
  };

  // When input is focused, show search text; otherwise, show value
  const displayValue = isFocused ? search : value;

  // --- Portal dropdown ---
  const dropdownMenu = isClient && open && dropdownPos
    ? createPortal(
        <div
          className="dropdown-portal-menu z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl max-h-48 overflow-y-auto animate-fade-in transition-all duration-200"
          style={{
            position: 'absolute',
            left: dropdownPos.left,
            top: dropdownPos.top,
            width: dropdownPos.width,
            transformOrigin: 'top',
          }}
          ref={dropdownRef}
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          {filtered.length === 0 && <div className="p-2 text-gray-400">No results</div>}
          {filtered.map((name, idx) => (
            <div
              id={`location-option-${idx}`}
              key={name}
              className={`px-3 py-2 cursor-pointer text-xs sm:text-sm transition-colors ${idx === highlighted ? 'bg-cyan-100 text-cyan-900' : 'hover:bg-cyan-50'}`}
              onMouseDown={() => handleSelect(name)}
              onMouseEnter={() => setHighlighted(idx)}
            >
              {name}
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 text-xs sm:text-sm h-10 ${inputClassName}`}
        value={displayValue}
        onFocus={e => {
          setOpen(true);
          setIsFocused(true);
          setSearch(''); // Clear search so user can type immediately
          setHighlighted(-1);
          setTimeout(() => e.target.select(), 0);
        }}
        onChange={e => {
          setSearch(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        placeholder="Search location"
        onKeyDown={e => {
          if (!open) return;
          if (e.key === 'ArrowDown') {
            setHighlighted(h => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === 'ArrowUp') {
            setHighlighted(h => Math.max(h - 1, 0));
          } else if (e.key === 'Enter' && highlighted >= 0 && highlighted < filtered.length) {
            handleSelect(filtered[highlighted]);
            inputRef.current?.blur();
          } else if (e.key === 'Escape') {
            setOpen(false);
            setIsFocused(false);
          }
        }}
        autoComplete="off"
      />
      {dropdownMenu}
    </div>
  );
}

// Helper for days multi-select
const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type DaysDropdownProps = { value: string[]; onChange: (days: string[]) => void; open?: boolean; setOpen?: (open: boolean) => void };
function DaysDropdown({ value, onChange, dropdownWidthClass = 'w-32', open: controlledOpen, setOpen: setControlledOpen }: DaysDropdownProps & { dropdownWidthClass?: string }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    function updateDropdownPos() {
      const rect = buttonRef.current!.getBoundingClientRect();
      setDropdownPos({ left: rect.left, top: rect.bottom + window.scrollY, width: rect.width });
    }
    updateDropdownPos();
    window.addEventListener('scroll', updateDropdownPos, true);
    window.addEventListener('resize', updateDropdownPos);
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, true);
      window.removeEventListener('resize', updateDropdownPos);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  const dropdownMenu = isClient && open && dropdownPos
    ? createPortal(
        <div
          className={`dropdown-portal-menu z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl p-3 min-w-[140px] ${dropdownWidthClass} overflow-visible transition-all duration-200 animate-fade-in`}
          style={{
            position: 'absolute',
            left: dropdownPos.left,
            top: dropdownPos.top,
            width: dropdownPos.width,
            transformOrigin: 'top',
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1">
            {allDays.map((day: string) => (
              <label key={day} className="flex items-center py-1 px-2 rounded hover:bg-cyan-50 cursor-pointer transition-colors">
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
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative w-full" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-left bg-white hover:bg-cyan-50 flex justify-between items-center min-h-[48px] text-base shadow-sm transition-all"
        onMouseDown={e => { e.preventDefault(); setOpen(!open); }}
        aria-haspopup="listbox"
        aria-expanded={open}
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
        <span className="flex items-center justify-center h-full ml-2">
          <svg className={`w-5 h-5 text-cyan-400 align-middle transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {dropdownMenu}
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
  const [openTimePicker, setOpenTimePicker] = useState<{row: number, field: 'start' | 'end'} | null>(null);
  const startBtnRefs = useRef<(HTMLButtonElement | null)[]>([]).current;
  const endBtnRefs = useRef<(HTMLButtonElement | null)[]>([]).current;
  const [openDropdown, setOpenDropdown] = useState<null | { type: 'days' | 'time' | 'location', row: number, field?: 'start' | 'end' }>(null);
  const locationInputRefs: React.MutableRefObject<React.RefObject<HTMLInputElement>[]> = useRef([]);
  const [isTimeDropdownHovered, setIsTimeDropdownHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    breakfast: { start: '', end: '' },
    lunch: { start: '', end: '' },
    dinner: { start: '', end: '' },
    freeTime: { start: '', end: '' },
  });
  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__MOCK_JSON__ = mockJson;
    }
  }, []);

  const [disabledSlider, setDisabledSlider] = useState<WeightageKey | null>(null);
  const [showTooltip, setShowTooltip] = useState<WeightageKey | null>(null);

  const handleWeightageChange = (category: WeightageKey, value: number) => {
    const keys: WeightageKey[] = ['rmp', 'boilerGrades', 'hecticness'];
    const otherKeys = keys.filter(k => k !== category);
    const sumOthers = weightage[otherKeys[0]] + weightage[otherKeys[1]];
    // Clamp value so total never exceeds 100
    let clampedValue = Math.min(value, 100 - sumOthers);
    let newWeightage = { ...weightage, [category]: clampedValue };

    if (clampedValue >= 100) {
      newWeightage = { rmp: 0, boilerGrades: 0, hecticness: 0, [category]: 100 };
      setDisabledSlider(category);
    } else {
      setDisabledSlider(null);
    }
    setWeightage(newWeightage);
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
  }, [openDaysDropdown]);

  useEffect(() => {
    if (!openDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // --- Close Time dropdown on outside click ---
  useEffect(() => {
    if (!openDropdown || openDropdown.type !== 'time') return;
    function handlePointerDown(e: PointerEvent) {
      if (!openDropdown) return;
      const btn = (openDropdown.field === 'start') ? startBtnRefs[openDropdown.row] : endBtnRefs[openDropdown.row];
      const dropdowns = Array.from(document.querySelectorAll('.dropdown-portal-menu'));
      const isInDropdown = dropdowns.some(el => el.contains(e.target as Node));
      if (btn && btn.contains(e.target as Node)) return;
      if (isInDropdown) return;
      setOpenDropdown(null);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openDropdown]);

  // Helper to get allowed max for each slider
  const getAllowedMax = (category: WeightageKey) => {
    const keys: WeightageKey[] = ['rmp', 'boilerGrades', 'hecticness'];
    const otherKeys = keys.filter(k => k !== category);
    return 100 - weightage[otherKeys[0]] - weightage[otherKeys[1]];
  };

  // Helper to get slider background style
  const getSliderBackground = (category: WeightageKey, color: string) => {
    const allowedMax = getAllowedMax(category);
    // Clamp to [0,100]
    const stop = Math.max(0, Math.min(allowedMax, 100));
    // Color for the active part
    let activeColor = color;
    if (color === 'cyan') activeColor = '#22d3ee';
    if (color === 'green') activeColor = '#4ade80';
    if (color === 'blue') activeColor = '#60a5fa';
    // Grey for the rest
    const grey = '#e5e7eb';
    return {
      background: `linear-gradient(90deg, ${activeColor} 0% ${stop}%, ${grey} ${stop}%, ${grey} 100%)`
    };
  };

  const weightageSum = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
  const [showCalcTooltip, setShowCalcTooltip] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-300 via-cyan-300 to-blue-400 py-0 px-0 pb-24">
      {/* Huddle Logo and nav */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <div className="flex items-center space-x-3">
          <Image src="/images/huddle_logo.png" alt="Huddle Logo" width={220} height={80} />
        </div>
      </div>
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Schedule Rater</h1>
          <p className="text-lg text-gray-700">Upload your schedule — we'll score it using RateMyProfessor, BoilerGrades, and how hectic it looks.</p>
        </div>
        {/* Do you want to use a new image? */}
        {scheduleGenerated && (
          <div className="w-full flex flex-col items-center justify-center mb-8">
            <button
              className="w-full max-w-xl mx-auto border-2 border-red-600 text-red-600 bg-white py-3 px-6 rounded-xl text-lg font-bold hover:bg-red-50 transition mb-2 text-center"
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
            <div className="w-full max-w-xl mx-auto text-center text-red-700 font-medium text-sm mt-1">
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
            {/* Edit Schedule Section - w-full, no max-width or centering */}
            <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 md:p-12 mb-8 border border-green-200 w-full transition-all flex flex-col items-center justify-center" style={{ overflow: 'visible' }}>
              <div className="flex flex-col items-center gap-1 mb-8 w-full">
                <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 tracking-tight">Edit Schedule</h2>
                <span className="text-gray-500 text-base md:text-lg font-medium max-w-xl mx-auto text-center">Add, edit, or remove your classes below.</span>
              </div>
              <div className="w-full relative flex flex-col items-center justify-center">
                <div className="relative w-full overflow-x-auto">
                  <div className="flex flex-row w-full min-w-[900px] text-xs mb-4 bg-gradient-to-r from-green-100 via-cyan-50 to-blue-100 rounded-2xl shadow-sm border border-green-100 px-2 py-3 whitespace-nowrap">
                    <div className="font-bold text-center flex justify-center items-center py-2 rounded-tl-2xl text-green-900 flex-none w-8">✓</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-[0.5]">Subj</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-[0.5]">Code</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-1">Type</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-1">Days</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-1">Start</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-1">End</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-[2]">Loc</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-1">Instr</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 text-green-900 flex-[0.5]">Cr</div>
                    <div className="font-bold text-center flex justify-center items-center py-2 rounded-tr-2xl text-green-900 flex-none w-8">❌</div>
                  </div>
                {schedule.map((row, idx) => {
                  // Ensure the ref exists and is always a RefObject<HTMLInputElement>
                  if (!locationInputRefs.current[idx]) {
                    locationInputRefs.current[idx] = React.createRef<HTMLInputElement>();
                  }
                  const locationInputRef = locationInputRefs.current[idx];
                  return (
                    <div
                      className={`flex flex-row w-full mb-4 py-3 text-sm rounded-xl transition-all duration-150 px-4 gap-4 ${idx % 2 === 1 ? 'bg-gradient-to-r from-green-50 via-cyan-50 to-blue-50' : 'bg-white'} hover:shadow-md hover:scale-[1.01] relative items-center`}
                      style={{ overflow: 'visible' }}
                      key={idx}
                    >
                      <div className="flex justify-center items-center whitespace-nowrap flex-none w-8"><input type="checkbox" className="w-4 h-4 accent-green-500" checked={row.willAttend || false} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].willAttend = e.target.checked; setSchedule(newSchedule); }} /></div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-[0.5]"><input type="text" className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold text-xs transition-all" value={row.courseSubject} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseSubject = e.target.value; setSchedule(newSchedule); }} placeholder="Subj" /></div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-[0.5]"><input type="text" className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold text-xs transition-all" value={row.courseCode} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseCode = e.target.value; setSchedule(newSchedule); }} placeholder="Code" /></div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-1"><input type="text" className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold text-xs transition-all" value={row.courseType} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseType = e.target.value; setSchedule(newSchedule); }} placeholder="Type" /></div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-1">
                        <div className="relative overflow-visible w-full">
                          <DaysDropdown
                            value={row.courseDays}
                            onChange={(days: string[]) => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseDays = days;
                              setSchedule(newSchedule);
                            }}
                            dropdownWidthClass="w-full"
                            open={!!(openDropdown && openDropdown.type === 'days' && openDropdown.row === idx)}
                            setOpen={(open: boolean) => setOpenDropdown(open ? { type: 'days', row: idx } : null)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-1">
                        <div className="relative overflow-visible w-full">
                          <button
                            ref={el => { startBtnRefs[idx] = el; }}
                            type="button"
                            className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-400 font-semibold text-xs transition-all"
                            onClick={() => setOpenDropdown(openDropdown && openDropdown.type === 'time' && openDropdown.row === idx && openDropdown.field === 'start' ? null : { type: 'time', row: idx, field: 'start'})}
                          >
                            {row.courseTime.start || 'Start'}
                          </button>
                          {openDropdown && openDropdown.type === 'time' && openDropdown.row === idx && openDropdown.field === 'start' && startBtnRefs[idx] && isClient &&
                            createPortal(
                              <div
                                className="dropdown-portal-menu z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl p-2 min-w-[60px] max-h-60 overflow-y-auto animate-fade-in transition-all duration-200"
                                style={{
                                  position: 'absolute',
                                  left: startBtnRefs[idx].getBoundingClientRect().left,
                                  top: startBtnRefs[idx].getBoundingClientRect().bottom + window.scrollY,
                                  width: startBtnRefs[idx].getBoundingClientRect().width,
                                  marginTop: '0.25rem',
                                  transformOrigin: 'top',
                                }}
                                onMouseEnter={() => setIsTimeDropdownHovered(true)}
                                onMouseLeave={() => setIsTimeDropdownHovered(false)}
                              >
                                {timeOptions.map((time) => (
                                  <div
                                    key={time}
                                    className="px-2 py-1 cursor-pointer hover:bg-cyan-50 text-xs text-gray-700"
                                    onClick={() => {
                                      const newSchedule = [...schedule];
                                      newSchedule[idx].courseTime.start = time;
                                      setSchedule(newSchedule);
                                      setOpenDropdown(null);
                                    }}
                                  >
                                    {time}
                                  </div>
                                ))}
                              </div>,
                              document.body
                            )
                          }
                        </div>
                      </div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-1">
                        <div className="relative overflow-visible w-full">
                          <button
                            ref={el => { endBtnRefs[idx] = el; }}
                            type="button"
                            className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-400 font-semibold text-xs transition-all"
                            onClick={() => setOpenDropdown(openDropdown && openDropdown.type === 'time' && openDropdown.row === idx && openDropdown.field === 'end' ? null : { type: 'time', row: idx, field: 'end'})}
                          >
                            {row.courseTime.end || 'End'}
                          </button>
                          {openDropdown && openDropdown.type === 'time' && openDropdown.row === idx && openDropdown.field === 'end' && endBtnRefs[idx] && isClient &&
                            createPortal(
                              <div
                                className="dropdown-portal-menu z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl p-2 min-w-[60px] max-h-60 overflow-y-auto animate-fade-in transition-all duration-200"
                                style={{
                                  position: 'absolute',
                                  left: endBtnRefs[idx].getBoundingClientRect().left,
                                  top: endBtnRefs[idx].getBoundingClientRect().bottom + window.scrollY,
                                  width: endBtnRefs[idx].getBoundingClientRect().width,
                                  marginTop: '0.25rem',
                                  transformOrigin: 'top',
                                }}
                                onMouseEnter={() => setIsTimeDropdownHovered(true)}
                                onMouseLeave={() => setIsTimeDropdownHovered(false)}
                              >
                                {timeOptions.map((time) => (
                                  <div
                                    key={time}
                                    className="px-2 py-1 cursor-pointer hover:bg-cyan-50 text-xs text-gray-700"
                                    onClick={() => {
                                      const newSchedule = [...schedule];
                                      newSchedule[idx].courseTime.end = time;
                                      setSchedule(newSchedule);
                                      setOpenDropdown(null);
                                    }}
                                  >
                                    {time}
                                  </div>
                                ))}
                              </div>,
                              document.body
                            )
                          }
                        </div>
                      </div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-[2]">
                        <div className="relative overflow-visible w-full">
                          <LocationDropdown
                            value={row.courseLocation}
                            onChange={(loc: string) => {
                              const newSchedule = [...schedule];
                              newSchedule[idx].courseLocation = loc;
                              setSchedule(newSchedule);
                            }}
                            inputClassName="w-full h-8 px-1 py-1 overflow-x-auto resize-x border border-gray-200 rounded-lg transition-all text-xs"
                            open={!!(openDropdown && openDropdown.type === 'location' && openDropdown.row === idx)}
                            setOpen={open => setOpenDropdown(open ? { type: 'location', row: idx } : null)}
                            inputRef={locationInputRef}
                          />
                        </div>
                      </div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-1"><input type="text" className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold text-xs transition-all" value={row.instructorName} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].instructorName = e.target.value; setSchedule(newSchedule); }} placeholder="Instr" /></div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-[0.5]"><input type="number" min="0" className="w-full h-8 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold text-xs transition-all" value={row.credits} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].credits = e.target.value.replace(/[^0-9]/g, ''); setSchedule(newSchedule); }} placeholder="Cr" /></div>
                      <div className="flex justify-center items-center whitespace-nowrap flex-none w-8"><button className="text-red-500 hover:text-red-700 font-bold px-1 text-base transition-all" onClick={() => { setSchedule(schedule.filter((_, i) => i !== idx)); }} aria-label="Delete row">❌</button></div>
                    </div>
                  );
                })}
              </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-gradient-to-r from-green-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-md hover:from-green-600 hover:to-cyan-600 transform transition-all hover:scale-105 flex items-center gap-2"
                  onClick={() => setSchedule([...schedule, initialScheduleRow])}
                >
                  <span className="text-2xl">＋</span> Add Class
                </button>
              </div>
              <div className="text-gray-400 text-base mt-3 text-right font-medium">Tip: Double-click a field to edit.</div>
              {/* Explanatory note about the checkbox */}
              <div className="w-full flex items-center justify-center mt-2 mb-2">
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2 text-cyan-800 text-base flex items-center gap-2 mx-auto max-w-xl">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="4" fill="#ECFEFF" stroke="#06b6d4" strokeWidth="2"/>
                    <path d="M7 12l3 3 7-7" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>
                    <b>Checkbox:</b> Tick this if you <b>actually plan to attend</b> this class. Only checked classes will be factored into your Huddle score!
                  </span>
                </div>
              </div>
            </div>
            {/* Advanced Options and Set Weightage side by side, w-full, no max-width or centering */}
            <div className="flex flex-col md:flex-row gap-8 w-full mb-0">
              {/* Advanced Options - left */}
              <div className="bg-white rounded-lg shadow-md p-10 border border-gray-300 flex-1 min-w-[280px] w-full space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-800 mb-1">Advanced Options</h2>
                <div className="w-full border-b border-gray-200 mb-4"></div>
                <div className="w-full mb-4">
                  <div className="flex items-start gap-3 bg-cyan-50 border border-cyan-100 rounded-md px-4 py-3 text-cyan-800 text-base shadow-sm">
                    <svg className="w-6 h-6 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
                    <span>
                      <b>Set your preferred times for meals and free time.</b> <br/>
                      We'll use these to help you spot schedule conflicts and optimize your day! This makes your Huddle experience more personalized and helps you balance academics with breaks and self-care.
                    </span>
                  </div>
                </div>
                <form className="w-full bg-gray-50 rounded-md p-6">
                  <div className="divide-y divide-gray-200">
                    {/* Breakfast */}
                    <div className="grid grid-cols-12 items-center gap-4 py-4">
                      <div className="col-span-3 flex items-center gap-2 text-lg font-bold text-gray-700 whitespace-nowrap"><span className="text-xl">🍳</span>Breakfast</div>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4 ml-2" value={advancedOptions.breakfast.start} onChange={e => setAdvancedOptions(opt => ({ ...opt, breakfast: { ...opt.breakfast, start: e.target.value } }))}>
                        <option value="">Start</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4" value={advancedOptions.breakfast.end} onChange={e => setAdvancedOptions(opt => ({ ...opt, breakfast: { ...opt.breakfast, end: e.target.value } }))}>
                        <option value="">End</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {/* Lunch */}
                    <div className="grid grid-cols-12 items-center gap-4 py-4">
                      <div className="col-span-3 flex items-center gap-2 text-lg font-bold text-gray-700 whitespace-nowrap"><span className="text-xl">🍽️</span>Lunch</div>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4 ml-2" value={advancedOptions.lunch.start} onChange={e => setAdvancedOptions(opt => ({ ...opt, lunch: { ...opt.lunch, start: e.target.value } }))}>
                        <option value="">Start</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4" value={advancedOptions.lunch.end} onChange={e => setAdvancedOptions(opt => ({ ...opt, lunch: { ...opt.lunch, end: e.target.value } }))}>
                        <option value="">End</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {/* Dinner */}
                    <div className="grid grid-cols-12 items-center gap-4 py-4">
                      <div className="col-span-3 flex items-center gap-2 text-lg font-bold text-gray-700 whitespace-nowrap"><span className="text-xl">🍽️</span>Dinner</div>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4 ml-2" value={advancedOptions.dinner.start} onChange={e => setAdvancedOptions(opt => ({ ...opt, dinner: { ...opt.dinner, start: e.target.value } }))}>
                        <option value="">Start</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4" value={advancedOptions.dinner.end} onChange={e => setAdvancedOptions(opt => ({ ...opt, dinner: { ...opt.dinner, end: e.target.value } }))}>
                        <option value="">End</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {/* Free Time */}
                    <div className="grid grid-cols-12 items-center gap-4 py-4">
                      <div className="col-span-3 flex items-center gap-2 text-lg font-bold text-gray-700 whitespace-nowrap"><span className="text-xl">🧘</span>Free Time</div>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4 ml-2" value={advancedOptions.freeTime.start} onChange={e => setAdvancedOptions(opt => ({ ...opt, freeTime: { ...opt.freeTime, start: e.target.value } }))}>
                        <option value="">Start</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-base bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-200 shadow-sm col-span-4" value={advancedOptions.freeTime.end} onChange={e => setAdvancedOptions(opt => ({ ...opt, freeTime: { ...opt.freeTime, end: e.target.value } }))}>
                        <option value="">End</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              {/* Set Weightage - right */}
              <div className="bg-white rounded-lg shadow-md p-10 border border-gray-300 flex-1 min-w-[280px] w-full min-h-[600px] md:min-h-[700px] h-full flex flex-col">
                <div className="flex flex-col mb-4 gap-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800">Set Weightage</h2>
                  <div className="w-full border-b border-gray-200 mt-2 mb-4"></div>
                  <p className="text-gray-700 text-base md:text-lg mt-2 max-w-2xl">
                    Adjust the sliders to set how much each factor (professor ratings, grade outcomes, and schedule hecticness) matters to you. Your final schedule score will reflect your personal priorities, helping you find the best fit for your needs.
                  </p>
                </div>
                <div className="flex-1 flex flex-col gap-8 justify-between h-full">
                  {/* RMP Rating */}
                  <div className="bg-cyan-50 rounded-lg border border-cyan-100 p-6 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-base font-bold text-gray-700 flex items-center gap-2">RMP Rating <span className="ml-1 align-middle"><InfoIcon text="Based on student reviews from RateMyProfessor.com, this score reflects professor quality, clarity, helpfulness, and teaching style." /></span></label>
                      <span className="text-base font-bold text-cyan-700">{weightage.rmp}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={100}
                      value={weightage.rmp}
                      onChange={e => handleWeightageChange('rmp', Number(e.target.value))}
                      className={`w-full h-3 rounded-md appearance-none accent-cyan-600 shadow-sm ${(disabledSlider && disabledSlider !== 'rmp') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={getSliderBackground('rmp', 'cyan')}
                      disabled={!!(disabledSlider && disabledSlider !== 'rmp')}
                      onMouseEnter={() => { if (disabledSlider && disabledSlider !== 'rmp') setShowTooltip('rmp'); }}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === 'rmp' && disabledSlider && disabledSlider !== 'rmp' && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-700 text-white text-xs rounded shadow z-10">
                        Set to 0 because another weightage is 100.
                      </div>
                    )}
                  </div>
                  {/* Boiler Grades */}
                  <div className="bg-green-50 rounded-lg border border-green-100 p-6 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-base font-bold text-gray-700 flex items-center gap-2">Boiler Grades <span className="ml-1 align-middle"><InfoIcon text="Reflects the average GPA students have earned in these class over recent semesters." /></span></label>
                      <span className="text-base font-bold text-green-700">{weightage.boilerGrades}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={100}
                      value={weightage.boilerGrades}
                      onChange={e => handleWeightageChange('boilerGrades', Number(e.target.value))}
                      className={`w-full h-3 rounded-md appearance-none accent-green-600 shadow-sm ${(disabledSlider && disabledSlider !== 'boilerGrades') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={getSliderBackground('boilerGrades', 'green')}
                      disabled={!!(disabledSlider && disabledSlider !== 'boilerGrades')}
                      onMouseEnter={() => { if (disabledSlider && disabledSlider !== 'boilerGrades') setShowTooltip('boilerGrades'); }}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === 'boilerGrades' && disabledSlider && disabledSlider !== 'boilerGrades' && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-700 text-white text-xs rounded shadow z-10">
                        Set to 0 because another weightage is 100.
                      </div>
                    )}
                  </div>
                  {/* Hecticness */}
                  <div className="bg-blue-50 rounded-lg border border-blue-100 p-6 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-base font-bold text-gray-700 flex items-center gap-2">Hecticness <span className="ml-1 align-middle"><InfoIcon text="Reflects how evenly (or unevenly) your classes are spread out — the more bunched up, the higher the hecticness." /></span></label>
                      <span className="text-base font-bold text-blue-700">{weightage.hecticness}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={100}
                      value={weightage.hecticness}
                      onChange={e => handleWeightageChange('hecticness', Number(e.target.value))}
                      className={`w-full h-3 rounded-md appearance-none accent-blue-600 shadow-sm ${(disabledSlider && disabledSlider !== 'hecticness') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={getSliderBackground('hecticness', 'blue')}
                      disabled={!!(disabledSlider && disabledSlider !== 'hecticness')}
                      onMouseEnter={() => { if (disabledSlider && disabledSlider !== 'hecticness') setShowTooltip('hecticness'); }}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === 'hecticness' && disabledSlider && disabledSlider !== 'hecticness' && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-700 text-white text-xs rounded shadow z-10">
                        Set to 0 because another weightage is 100.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Calculate Score button below both cards, centered and responsive */}
            <div className="w-full flex justify-center mt-10 mb-0 pb-4">
              <div className="relative w-full max-w-lg mx-auto">
                <button
                  className={`w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white py-4 px-8 rounded-xl text-xl font-semibold hover:from-green-500 hover:to-cyan-600 transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-cyan-200 shadow-md ${weightageSum !== 100 ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (weightageSum === 100) {
                      setFinalScore(calculateFinalScore(weightage, parsed));
                    }
                  }}
                  disabled={weightageSum !== 100}
                  onMouseEnter={() => { if (weightageSum !== 100) setShowCalcTooltip(true); }}
                  onMouseLeave={() => setShowCalcTooltip(false)}
                >
                  Calculate Score
                </button>
                {showCalcTooltip && weightageSum !== 100 && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-700 text-white text-base rounded shadow z-10 text-center whitespace-nowrap">
                    The weights must add up to 100 to calculate the score.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Score Display */}
        {finalScore !== null && (
          <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-cyan-100 mt-8 mb-8 max-w-5xl w-full mx-auto flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-700">Your Schedule Score</h2>
            {/* Huddle Score Circle replaces the numeric score */}
            <div className="mb-2 flex justify-center">
              {(() => {
                const allCourses = parsed.allCourses || [];
                const _rawCourses = allCourses.map((c: { courseName: string }) => {
                  const courseData = (typeof window !== 'undefined' && window.__MOCK_JSON__ ? window.__MOCK_JSON__ : {})[c.courseName] || {};
                  const gpa = courseData.boilergrades_data?.average_gpa ?? null;
                  const usedCourseAvg = courseData.boilergrades_data?.used_course_avg ?? false;
                  const rmpComments = courseData.rmp_comments || [];
                  const avgQuality = rmpComments.length ? (rmpComments.reduce((s: number, c: { qualityRating: number }) => s + c.qualityRating, 0) / rmpComments.length).toFixed(2) : null;
                  const avgDifficulty = rmpComments.length ? (rmpComments.reduce((s: number, c: { difficulty: number }) => s + c.difficulty, 0) / rmpComments.length).toFixed(2) : null;
                  const wouldTakeAgain = rmpComments.length ? Math.round((rmpComments.filter((c: { wouldTakeAgain: number | null }) => c.wouldTakeAgain === 1).length / rmpComments.length) * 100) : null;
                  const numReviews = rmpComments.length;
                  const summary = courseData.comments_summary?.summary || null;
                  const strengths = courseData.comments_summary?.strengths || [];
                  const weaknesses = courseData.comments_summary?.weaknesses || [];
                  return {
                    courseName: c.courseName,
                    gpa,
                    usedCourseAvg,
                    avgQuality,
                    avgDifficulty,
                    wouldTakeAgain,
                    numReviews,
                    summary,
                    strengths,
                    weaknesses,
                  };
                });
                const dataWithRawCourses = { ...parsed, _rawCourses };
                // Only render the BigScoreCircle from ScheduleScoreDetails
                // @ts-ignore
                return <div className="scale-110"><ScheduleScoreDetails data={dataWithRawCourses} onlyBigScore /></div>;
              })()}
            </div>
            <button
              className="flex items-center mx-auto px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg font-semibold hover:bg-cyan-200 transition mb-2 mt-2"
              onClick={() => setAnalysisOpen((open) => !open)}
              aria-expanded={analysisOpen}
              aria-controls="schedule-analysis-dropdown"
            >
              {analysisOpen ? 'Hide' : 'Show'} Schedule Analysis
              <span className="ml-2">{analysisOpen ? '▲' : '▼'}</span>
            </button>
            {analysisOpen && (
              <div className="relative w-full flex flex-col items-center mt-4">
                {/* Sub-category Cards Row */}
                <div className="flex flex-col md:flex-row justify-center items-stretch gap-x-8 w-full max-w-[105vw] mx-auto">
                  {(() => {
                    const allCourses = parsed.allCourses || [];
                    const _rawCourses = allCourses.map((c: { courseName: string }) => {
                      const courseData = (typeof window !== 'undefined' && window.__MOCK_JSON__ ? window.__MOCK_JSON__ : {})[c.courseName] || {};
                      const gpa = courseData.boilergrades_data?.average_gpa ?? null;
                      const usedCourseAvg = courseData.boilergrades_data?.used_course_avg ?? false;
                      const rmpComments = courseData.rmp_comments || [];
                      const avgQuality = rmpComments.length ? (rmpComments.reduce((s: number, c: { qualityRating: number }) => s + c.qualityRating, 0) / rmpComments.length).toFixed(2) : null;
                      const avgDifficulty = rmpComments.length ? (rmpComments.reduce((s: number, c: { difficulty: number }) => s + c.difficulty, 0) / rmpComments.length).toFixed(2) : null;
                      const wouldTakeAgain = rmpComments.length ? Math.round((rmpComments.filter((c: { wouldTakeAgain: number | null }) => c.wouldTakeAgain === 1).length / rmpComments.length) * 100) : null;
                      const numReviews = rmpComments.length;
                      const summary = courseData.comments_summary?.summary || null;
                      const strengths = courseData.comments_summary?.strengths || [];
                      const weaknesses = courseData.comments_summary?.weaknesses || [];
                      return {
                        courseName: c.courseName,
                        gpa,
                        usedCourseAvg,
                        avgQuality,
                        avgDifficulty,
                        wouldTakeAgain,
                        numReviews,
                        summary,
                        strengths,
                        weaknesses,
                      };
                    });
                    const dataWithRawCourses = { ...parsed, _rawCourses };
                    // Render only the sub-cards from ScheduleScoreDetails
                    // @ts-ignore
                    return <ScheduleScoreDetails data={dataWithRawCourses} onlySubCards />;
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
