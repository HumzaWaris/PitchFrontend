/**
 * Custom hook for Schedule Rater state management
 * Centralizes all state logic and provides clean interface for components
 */

import { useState, useEffect, useRef } from 'react';
import { ScheduleRow, CrnRow, WeightageConfig, AdvancedOptions, ParsedScheduleData, ScheduleRaterJson } from '../types';
import { parseScheduleRaterJson, calculateFinalScore, validateWeightage } from '../utils/dataProcessing';



// Mock data - will be replaced with API calls
const mockJson = {
  "PHIL 20800": {
    instructorName: "Eric Sampson",
    boilergrades_data: { average_gpa: 3.603, used_course_avg: false },
    rmp_comments: [
      { qualityRating: 4, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 5, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 4, difficulty: 3, wouldTakeAgain: 1 },
      { qualityRating: 3, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 4, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 5, difficulty: 1, wouldTakeAgain: 1 },
      { qualityRating: 4, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 3, difficulty: 3, wouldTakeAgain: null },
      { qualityRating: 4, difficulty: 2, wouldTakeAgain: 1 },
      { qualityRating: 5, difficulty: 2, wouldTakeAgain: 1 }
    ],
    comments_summary: {
      summary: "Professor Sampson is widely praised for his engaging, entertaining, and clear lectures that make complex philosophical concepts accessible and interesting. Students appreciate his passion for philosophy and his availability during office hours. However, several students found the grading, especially on exams and quizzes, to be subjective and sometimes unclear, with concerns about TA grading fairness. A few students also noted issues with quiz content and mandatory attendance. Overall, while the professor is charismatic and a strong communicator, some students suggest the grading system could be improved.",
      strengths: [
        "Engaging and entertaining lectures that clarify complex philosophical ideas.",
        "Passionate and approachable, with good availability during office hours."
      ],
      weaknesses: [
        "Subjective and sometimes unclear grading, including TA grading inconsistencies.",
        "Concerns about quiz content and mandatory attendance."
      ]
    }
  },
  // ... other courses would be here
  hecticness_final_score: 0.86,
  boilergrades_final_score: 0.825,
  rmp_final_score: 0.7095714285714285,
  final_score: 79.81904761904762
};

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

export function useScheduleRater() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scheduleUploaded, setScheduleUploaded] = useState(false);
  
  // UI flow state
  const [showUpload, setShowUpload] = useState(true);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [showCrnVerification, setShowCrnVerification] = useState(false);
  const [crnVerificationComplete, setCrnVerificationComplete] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondProgress, setSecondProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [secondTipIndex, setSecondTipIndex] = useState(0);
  

  
  // Schedule data state
  const [schedule, setSchedule] = useState<ScheduleRow[]>([{
    courseSubject: '',
    courseCode: '',
    courseType: '',
    courseDays: [],
    courseTime: { start: '', end: '' },
    courseLocation: '',
    instructorName: '',
    credits: ''
  }]);
  
  const [crnSchedule, setCrnSchedule] = useState<CrnRow[]>([{
    courseSubject: '',
    courseCode: '',
    courseType: '',
    crnNumber: '',
    instructorName: '',
    credits: ''
  }]);
  
  // Weightage and scoring state
  const [weightage, setWeightage] = useState<WeightageConfig>({
    rmp: 33,
    boilerGrades: 33,
    hecticness: 34,
  });
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  
  // Advanced options state
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    breakfast: { start: '', end: '' },
    lunch: { start: '', end: '' },
    dinner: { start: '', end: '' },
    freeTime: { start: '', end: '' },
    backToBack: '',
  });
  
  // UI interaction state
  const [openDaysDropdown, setOpenDaysDropdown] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<null | { type: 'days' | 'time' | 'location', row: number, field?: 'start' | 'end' }>(null);
  const [openTimePicker, setOpenTimePicker] = useState<{row: number, field: 'start' | 'end'} | null>(null);
  const [openInfo, setOpenInfo] = useState<null | 'rmp' | 'boilerGrades' | 'hecticness'>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  // Refs for dropdown positioning
  const tableRef = useRef<HTMLTableElement>(null);
  const startBtnRefs = useRef<(HTMLButtonElement | null)[]>([]).current;
  const endBtnRefs = useRef<(HTMLButtonElement | null)[]>([]).current;
  const locationInputRefs: React.MutableRefObject<React.RefObject<HTMLInputElement>[]> = useRef([]);
  
  // ============================================================================
  // Computed Values
  // ============================================================================
  
  const weightageSum = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
  const isWeightageValid = validateWeightage(weightage);
  
  // Parse mock data (will be replaced with API response)
  const parsed = parseScheduleRaterJson(mockJson);
  
  // ============================================================================
  // Event Handlers with API Integration
  // ============================================================================
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setScheduleUploaded(true);
  };
  
  const handleGenerateSchedule = () => {
    setLoading(true);
    setShowCrnVerification(false);
    setCrnVerificationComplete(false);
    setSecondLoading(false);
    setScheduleGenerated(false);
    setCommentsOpen(false);
    
    // Simulate processing time
    setTimeout(() => {
      setLoading(false);
      setShowCrnVerification(true);
      setShowUpload(false);
      
      // Initialize with sample data
      const initialClasses = [
        { courseSubject: 'CS', courseCode: '101', courseType: 'Lecture', crnNumber: '12345', instructorName: 'Dr. Smith', credits: '3', courseDays: ['Mon', 'Wed', 'Fri'], courseTime: { start: '10:00', end: '10:50' }, courseLocation: 'WALC 101' },
        { courseSubject: 'MATH', courseCode: '201', courseType: 'Lecture', crnNumber: '23456', instructorName: 'Dr. Johnson', credits: '3', courseDays: ['Tue', 'Thu'], courseTime: { start: '11:00', end: '11:50' }, courseLocation: 'WALC 201' },
        { courseSubject: 'ENG', courseCode: '101', courseType: 'Lecture', crnNumber: '34567', instructorName: 'Dr. Brown', credits: '3', courseDays: ['Mon', 'Wed', 'Fri'], courseTime: { start: '12:00', end: '12:50' }, courseLocation: 'WALC 301' }
      ];
      
      setCrnSchedule(initialClasses.map(({ courseSubject, courseCode, courseType, crnNumber, instructorName, credits }) => 
        ({ courseSubject, courseCode, courseType, crnNumber, instructorName: instructorName || '', credits: credits || '' })
      ));
      
      setSchedule(initialClasses.map(({ courseSubject, courseCode, courseType, instructorName, credits, courseDays, courseTime, courseLocation }) => 
        ({ courseSubject, courseCode, courseType, instructorName, credits, courseDays, courseTime, courseLocation })
      ));
    }, 7000);
  };
  
  const handleWeightageChange = (category: keyof WeightageConfig, value: number) => {
    const keys: (keyof WeightageConfig)[] = ['rmp', 'boilerGrades', 'hecticness'];
    const otherKeys = keys.filter(k => k !== category);
    const sumOthers = weightage[otherKeys[0]] + weightage[otherKeys[1]];
    
    // Clamp value so total never exceeds 100
    let clampedValue = Math.min(value, 100 - sumOthers);
    let newWeightage = { ...weightage, [category]: clampedValue };

    if (clampedValue >= 100) {
      newWeightage = { rmp: 0, boilerGrades: 0, hecticness: 0, [category]: 100 };
    }
    
    setWeightage(newWeightage);
  };
  
  const handleCalculateScore = () => {
    if (isWeightageValid) {
      setFinalScore(calculateFinalScore(weightage, parsed));
    }
  };
  
  const handleReset = () => {
    setShowUpload(true);
    setScheduleGenerated(false);
    setScheduleUploaded(false);
    setSelectedFile(null);
    setSchedule([{
      courseSubject: '',
      courseCode: '',
      courseType: '',
      courseDays: [],
      courseTime: { start: '', end: '' },
      courseLocation: '',
      instructorName: '',
      credits: ''
    }]);
    setCrnSchedule([{
      courseSubject: '',
      courseCode: '',
      courseType: '',
      crnNumber: '',
      instructorName: '',
      credits: ''
    }]);
    setFinalScore(null);
    setAnalysisOpen(false);
    setShowCrnVerification(false);
    setCrnVerificationComplete(false);
    setSecondLoading(false);
    setCommentsOpen(false);
  };
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // First loading effect (7 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const duration = 7000;
    
    if (loading) {
      setProgress(0);
      setTipIndex(0);
      const start = Date.now();
      
      interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.min(100, Math.round((elapsed / duration) * 100));
        setProgress(percent);
        
        if (percent >= 100) {
          clearInterval(interval);
        }
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [loading]);

  // Second loading effect (10 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const duration = 10000;
    
    if (secondLoading) {
      setSecondProgress(0);
      setSecondTipIndex(0);
      const start = Date.now();
      
      interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.min(100, Math.round((elapsed / duration) * 100));
        setSecondProgress(percent);
        
        if (percent >= 100) {
          clearInterval(interval);
        }
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [secondLoading]);

  // Tip rotation effects
  useEffect(() => {
    let tipInterval: NodeJS.Timeout;
    if (loading) {
      setTipIndex(0);
      tipInterval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => clearInterval(tipInterval);
  }, [loading]);

  useEffect(() => {
    let tipInterval: NodeJS.Timeout;
    if (secondLoading) {
      setSecondTipIndex(0);
      tipInterval = setInterval(() => {
        setSecondTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => clearInterval(tipInterval);
  }, [secondLoading]);

  // ============================================================================
  // Return Interface
  // ============================================================================
  
  return {
    // State
    selectedFile,
    scheduleUploaded,
    showUpload,
    scheduleGenerated,
    showCrnVerification,
    crnVerificationComplete,
    loading,
    secondLoading,
    progress,
    secondProgress,
    tipIndex,
    secondTipIndex,
    schedule,
    crnSchedule,
    weightage,
    finalScore,
    analysisOpen,
    advancedOptions,
    openDaysDropdown,
    openDropdown,
    openTimePicker,
    openInfo,
    commentsOpen,
    tableRef,
    startBtnRefs,
    endBtnRefs,
    locationInputRefs,
    
    // Computed values
    weightageSum,
    isWeightageValid,
    parsed,
    loadingTips,
    
    // Actions
    setSchedule,
    setCrnSchedule,
    setWeightage,
    setAdvancedOptions,
    setOpenDaysDropdown,
    setOpenDropdown,
    setOpenTimePicker,
    setOpenInfo,
    setCommentsOpen,
    setAnalysisOpen,
    
    // Event handlers
    handleFileSelect,
    handleGenerateSchedule,
    handleWeightageChange,
    handleCalculateScore,
    handleReset,
  };
} 