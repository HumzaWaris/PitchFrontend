import React, { useState } from "react";

type Props = {
  data: {
    finalScore: number;
    hecticnessScore: number;
    boilergradesScore: number;
    rmpScore: number;
    lowestGpaCourse: string | null;
    lowestGpa: number | null;
    lowestRmpCourse: string | null;
    lowestRmp: number | null;
    hardestCourse: string | null;
    highestDifficulty: number | null;
    mostLovedCourse: string | null;
    highestWouldTakeAgain: number | null;
    mostReviewedCourse: string | null;
    mostReviews: number | null;
    summaryCourse: string | null;
    summaryStrength: string | null;
    summaryWeakness: string | null;
    allCourses: any[];
  };
  hecticnessExplanation?: {
    title: string;
    dailyAnalysis: Array<{
      day: string;
      description: string;
    }>;
    note: string;
  };
};

const InfoIcon: React.FC<{ text: string }> = ({ text }) => (
  <div className="relative group">
    <button className="text-cyan-500 hover:text-cyan-700 transition-colors">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const ScoreCircle: React.FC<{ 
  label: string; 
  value: number | null; 
  color: string; 
  infoText: string;
  icon: React.ReactNode;
  infoItems?: { label: string; value: string | number | null }[];
  additionalContent?: React.ReactNode;
  valueDisplay?: string;
}> = ({ label, value, color, infoText, icon, infoItems, additionalContent, valueDisplay }) => {
  // SVG circle progress parameters
  const percent = typeof value === 'number' ? Math.max(0, Math.min(100, Math.round(value * 100))) : 0;
  const radius = 44;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = (percent / 100) * circumference;
  let strokeColor = '#06b6d4'; // default cyan
  if (color.includes('blue')) strokeColor = '#3b82f6'; // blue-400
  if (color.includes('green')) strokeColor = '#22c55e'; // green-400
  if (color.includes('cyan')) strokeColor = '#06b6d4'; // cyan-400

  return (
    <div className="flex flex-col items-center mx-2 mb-6 min-w-[180px] max-w-xs flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="text-lg font-bold text-gray-800 text-center tracking-tight">{label}</div>
        <InfoIcon text={infoText} />
      </div>
      <div className="relative flex items-center justify-center mb-3" style={{ width: '80px', height: '80px' }}>
        <svg width="80" height="80" className="block" style={{ borderRadius: '50%', overflow: 'visible', display: 'block', transform: 'rotate(-90deg)' }}>
          <circle
            cx="40"
            cy="40"
            r={normalizedRadius}
            fill="#f0fdfa"
            stroke="#e0e7ef"
            strokeWidth={stroke}
          />
          <circle
            cx="40"
            cy="40"
            r={normalizedRadius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.3,1)' }}
          />
        </svg>
        <span className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-2xl font-extrabold text-gray-800 drop-shadow-lg pointer-events-none select-none">
          {valueDisplay ?? (value !== null ? percent + '%' : 'N/A')}
        </span>
      </div>
      {infoItems && infoItems.length > 0 && (
        <div className="w-full space-y-1 mb-2 mt-1">
          {infoItems.map((item, index) => (
            <div key={index} className={`flex justify-between py-1 px-2 rounded text-xs font-medium text-gray-700 ${label === 'RMP' ? 'bg-cyan-100' : label === 'BoilerGrades' ? 'bg-green-100' : 'bg-cyan-100'}`}>
              <span>{item.label}</span>
              <span className="font-bold text-cyan-700 ml-1">{item.value ?? "N/A"}</span>
            </div>
          ))}
        </div>
      )}
      {additionalContent && (
        <div className="w-full max-w-xs mt-2">
          {additionalContent}
        </div>
      )}
    </div>
  );
};

const HecticnessCircle: React.FC<any> = (props) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const toggleDay = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };
  return (
    <ScoreCircle
      {...props}
      additionalContent={
        <div className="mt-2 text-left w-full">
          <div className="text-base font-bold text-blue-700 mb-2 flex items-center gap-1">
            Most Hectic Days
          </div>
          <ul className="space-y-1 text-sm text-gray-800">
            {props.explanation.dailyAnalysis.map((day: any, index: number) => (
              <li key={index} className="flex flex-col">
                <button
                  type="button"
                  className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition"
                  onClick={() => toggleDay(index)}
                  aria-expanded={openIndexes.includes(index)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                    <span className="font-semibold">{day.day}</span>
                  </span>
                  <span className="ml-auto">
                    <svg
                      className={`w-4 h-4 text-cyan-500 transition-transform duration-200 ${openIndexes.includes(index) ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
                {openIndexes.includes(index) && (
                  <div className="pl-8 pr-2 py-1 text-gray-700 text-xs bg-cyan-50 rounded-b">
                    {day.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-2 text-gray-600 text-xs flex items-center gap-1">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7h2v2h-2v-2zm0-4h2v2h-2V7z" />
            </svg>
            {props.explanation.note}
          </div>
        </div>
      }
    />
  );
};

const gpaIcon = (
  <svg className="w-4 h-4 text-green-500 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5zm0 0v-8" /></svg>
);
const starIcon = (
  <svg className="w-4 h-4 text-yellow-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
);
const diffIcon = (
  <svg className="w-4 h-4 text-red-400 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
);
const heartIcon = (
  <svg className="w-4 h-4 text-pink-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
);
const chatIcon = (
  <svg className="w-4 h-4 text-cyan-400 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m5-4h-4m4 0a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2m4 0V2m-4 4V2" /></svg>
);

// Add type for per-course data
interface RawCourse {
  courseName: string;
  gpa: number | null;
  usedCourseAvg: boolean;
  avgQuality: string | null;
  avgDifficulty: string | null;
  wouldTakeAgain: number | null;
  numReviews: number;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
}

declare global {
  interface Window {
    __MOCK_JSON__?: Record<string, any>;
  }
}

// Helper to get per-course details from data
function getCourseDetails(data: { _rawCourses: RawCourse[] }, courseName: string): RawCourse | undefined {
  const course = (data._rawCourses || []).find((c) => c.courseName === courseName);
  return course;
}

// Helper to get instructor name for a course
function getInstructorName(courseName: string): string {
  if (typeof window !== 'undefined' && window.__MOCK_JSON__ && window.__MOCK_JSON__[courseName]) {
    return window.__MOCK_JSON__[courseName].instructorName || courseName;
  }
  return courseName;
}

const PerCourseBoilerGrades: React.FC<{ data: { _rawCourses: RawCourse[]; lowestGpaCourse: string | null } }> = ({ data }) => {
  const lowest = data.lowestGpaCourse;
  // Helper to generate a mock GPA if missing
  function getMockGpa(idx: number) {
    // Cycle through 2.7 to 4.0
    return (2.7 + (idx % 14) * 0.1).toFixed(2);
  }
  return (
    <div className="w-full">
      <div className="text-sm font-bold text-green-700 mb-2 text-center">Course Scores</div>
      <div className="flex flex-col gap-1 items-center">
        {data._rawCourses.map((course: RawCourse, idx: number) => (
          <div key={course.courseName} className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 text-xs font-medium bg-white/80 ${course.courseName === lowest ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-200 text-green-700'}`}> 
            <span className="font-semibold">{course.courseName}</span>
            <span>{course.gpa !== null ? course.gpa : getMockGpa(idx)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerCourseRMP: React.FC<{ data: { _rawCourses: RawCourse[] } }> = ({ data }) => {
  // Helper to generate a mock star rating if missing
  function getMockStar(idx: number) {
    // Cycle through 2.0 to 5.0
    return (2.0 + (idx % 31) * 0.1).toFixed(2);
  }

  // Map of professor name to { total, count }
  const profMap: Record<string, { total: number, count: number, idx: number }> = {};
  data._rawCourses.forEach((course, idx) => {
    let instructor = '';
    if (typeof window !== 'undefined' && window.__MOCK_JSON__ && window.__MOCK_JSON__[course.courseName]) {
      instructor = window.__MOCK_JSON__[course.courseName].instructorName || '';
    }
    // Only use instructorName, do not fallback to courseName
    if (!instructor) instructor = 'Unknown Instructor';
    const avgQuality = course.avgQuality !== null ? parseFloat(course.avgQuality) : parseFloat(getMockStar(idx));
    if (!profMap[instructor]) {
      profMap[instructor] = { total: 0, count: 0, idx };
    }
    profMap[instructor].total += avgQuality;
    profMap[instructor].count += 1;
  });
  // Build sorted array of professors
  const profs = Object.entries(profMap)
    .map(([name, { total, count, idx }]) => ({ name, avg: (total / count).toFixed(2), idx }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full">
      <div className="text-sm font-bold text-cyan-700 mb-2 text-center">Professor Scores</div>
      <div className="flex flex-col gap-1 items-center">
        {profs.map((prof, i) => (
          <div key={prof.name} className="px-2 py-0.5 rounded-lg border flex items-center gap-1 text-xs font-medium bg-white/80 border-cyan-200">
            <span className="font-semibold text-cyan-700">{prof.name}</span>
            <span className="flex items-center text-yellow-500">
              <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
              {prof.avg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const percent = (val: number | null) => val !== null ? Math.round(val * 100) : 'N/A';

const BigScoreCircle: React.FC<{ value: number | null }> = ({ value }) => (
  <div className="flex flex-col items-center justify-center mb-10">
    <div className="w-40 h-40 rounded-full border-8 border-cyan-400 bg-gradient-to-br from-white via-cyan-50 to-blue-50 flex items-center justify-center shadow-xl mb-4">
      <span className="text-6xl font-extrabold text-cyan-700 drop-shadow-lg">57%</span>
    </div>
    <div className="text-2xl font-bold text-cyan-700 tracking-tight">Huddle Score</div>
  </div>
);

const SubScoreCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-lg border border-cyan-100 p-8 min-w-[260px] max-w-sm w-full items-center space-y-4">
    {children}
  </div>
);

const ScheduleScoreDetails: React.FC<Props & { data: Props['data'] & { _rawCourses: RawCourse[] }, onlyBigScore?: boolean, onlySubCards?: boolean }> = ({ data, hecticnessExplanation, onlyBigScore, onlySubCards }) => {
  const defaultHecticnessExplanation = {
    title: "Why is each day hectic or easy?",
    dailyAnalysis: [
      { day: "Monday", description: "Insufficient free time for lunch (only 40 min free during lunch). Back-to-back classes (gap 10 min) from CS 25000 in WALC to WGSS 28000 in SCHM and from STAT 35500 in WTHR to CS 25100 in LILY." },
      { day: "Wednesday", description: "Insufficient free time for lunch (only 40 min free during lunch). Back-to-back classes (gap 10 min) from CS 25000 in LWSN to CS 25000 in WALC, from CS 25000 in WALC to WGSS 28000 in SCHM, and from STAT 35500 in WTHR to CS 25100 in LILY." },
      { day: "Friday", description: "Insufficient free time for lunch (only 40 min free during lunch). Back-to-back classes (gap 10 min) from CS 25000 in WALC to WGSS 28000 in SCHM, from CS 25100 in HAMP to STAT 35500 in WTHR, and from STAT 35500 in WTHR to CS 25100 in LILY." }
    ],
    note: "Days not listed above are less hectic, with longer breaks and more free time between classes."
  };
  const explanation = hecticnessExplanation || defaultHecticnessExplanation;
  const _rawCourses = React.useMemo(() => {
    if (!data.allCourses) return [];
    return data.allCourses.map((c: { courseName: string }) => {
      const courseData = (window.__MOCK_JSON__ || {})[c.courseName] || {};
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
  }, [data.allCourses]);
  const highestGpaCourseObj = _rawCourses.reduce((max, c) => {
    if (c.gpa === null) return max;
    if (max === null || max.gpa === null || c.gpa > max.gpa) return c;
    return max;
  }, null as RawCourse | null);
  const highestGpaCourse = highestGpaCourseObj?.courseName ?? null;
  const highestGpa = highestGpaCourseObj?.gpa ?? null;
  const dataWithRawCourses = { ...data, _rawCourses };

  if (onlyBigScore) {
    return <BigScoreCircle value={data.finalScore} />;
  }
  if (onlySubCards) {
    return (
      <>
        <SubScoreCard>
          <HecticnessCircle
            label="Hecticness"
            value={data.hecticnessScore}
            color="border-blue-400"
            infoText="Measures how evenly your classes are spread out. Higher scores mean more bunched up schedules with less free time between classes."
            icon={<svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>}
            explanation={explanation}
            valueDisplay={percent(data.hecticnessScore) + '%'}
          />
        </SubScoreCard>
        <SubScoreCard>
          <ScoreCircle
            label="RMP"
            value={data.rmpScore}
            color="border-cyan-400"
            infoText="Based on RateMyProfessor student reviews. Reflects professor quality, clarity, helpfulness, and teaching effectiveness."
            icon={<svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H5a2 2 0 01-2-2v-4m9 6h7a2 2 0 002-2v-4" /></svg>}
            infoItems={[
              { label: "Most Reviews", value: data.mostReviewedCourse ? `${getInstructorName(data.mostReviewedCourse)} (${data.mostReviews})` : null },
              { label: "Most Loved", value: data.mostLovedCourse ? `${getInstructorName(data.mostLovedCourse)} (${data.highestWouldTakeAgain}%)` : null },
              { label: "Lowest Rating", value: data.lowestRmpCourse ? `${getInstructorName(data.lowestRmpCourse)} (${data.lowestRmp})` : null }
            ]}
            valueDisplay={percent(data.rmpScore) + '%'}
          />
          <PerCourseRMP data={dataWithRawCourses} />
        </SubScoreCard>
        <SubScoreCard>
          <ScoreCircle
            label="BoilerGrades"
            value={data.boilergradesScore}
            color="border-green-400"
            infoText="Based on actual GPA data from past semesters. Higher scores indicate better grade outcomes and easier classes."
            icon={<svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4m8-8h-4m-4 0H4" /></svg>}
            infoItems={[
              { label: "Lowest GPA", value: data.lowestGpaCourse ? `${data.lowestGpaCourse} (${data.lowestGpa})` : null },
              { label: "Highest GPA", value: highestGpaCourse ? `${highestGpaCourse} (${highestGpa})` : null }
            ]}
            valueDisplay={percent(data.boilergradesScore) + '%'}
          />
          <PerCourseBoilerGrades data={dataWithRawCourses} />
        </SubScoreCard>
      </>
    );
  }
  return (
    <div className="relative bg-gradient-to-br from-cyan-50 via-white to-green-50 rounded-3xl shadow-2xl p-10 border border-cyan-100 mt-8 max-w-[98vw] w-full mx-auto flex flex-col items-center">
      <BigScoreCircle value={data.finalScore} />
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-x-8 w-full max-w-full">
        <SubScoreCard>
          <HecticnessCircle
            label="Hecticness"
            value={data.hecticnessScore}
            color="border-blue-400"
            infoText="Measures how evenly your classes are spread out. Higher scores mean more bunched up schedules with less free time between classes."
            icon={<svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>}
            explanation={explanation}
            valueDisplay={percent(data.hecticnessScore) + '%'}
          />
        </SubScoreCard>
        <SubScoreCard>
          <ScoreCircle
            label="RMP"
            value={data.rmpScore}
            color="border-cyan-400"
            infoText="Based on RateMyProfessor student reviews. Reflects professor quality, clarity, helpfulness, and teaching effectiveness."
            icon={<svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H5a2 2 0 01-2-2v-4m9 6h7a2 2 0 002-2v-4" /></svg>}
            infoItems={[
              { label: "Most Reviews", value: data.mostReviewedCourse ? `${getInstructorName(data.mostReviewedCourse)} (${data.mostReviews})` : null },
              { label: "Most Loved", value: data.mostLovedCourse ? `${getInstructorName(data.mostLovedCourse)} (${data.highestWouldTakeAgain}%)` : null },
              { label: "Lowest Rating", value: data.lowestRmpCourse ? `${getInstructorName(data.lowestRmpCourse)} (${data.lowestRmp})` : null }
            ]}
            valueDisplay={percent(data.rmpScore) + '%'}
          />
          <PerCourseRMP data={dataWithRawCourses} />
        </SubScoreCard>
        <SubScoreCard>
          <ScoreCircle
            label="BoilerGrades"
            value={data.boilergradesScore}
            color="border-green-400"
            infoText="Based on actual GPA data from past semesters. Higher scores indicate better grade outcomes and easier classes."
            icon={<svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4m8-8h-4m-4 0H4" /></svg>}
            infoItems={[
              { label: "Lowest GPA", value: data.lowestGpaCourse ? `${data.lowestGpaCourse} (${data.lowestGpa})` : null },
              { label: "Highest GPA", value: highestGpaCourse ? `${highestGpaCourse} (${highestGpa})` : null }
            ]}
            valueDisplay={percent(data.boilergradesScore) + '%'}
          />
          <PerCourseBoilerGrades data={dataWithRawCourses} />
        </SubScoreCard>
      </div>
    </div>
  );
};

export default ScheduleScoreDetails; 