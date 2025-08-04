/**
 * Type definitions for the Schedule Rater application
 * Centralized here for better maintainability and reusability
 */

// ============================================================================
// API Response Types
// ============================================================================

export type RmpComment = {
  qualityRating: number;
  difficulty: number;
  wouldTakeAgain: number | null;
};

export type BoilergradesData = {
  average_gpa: number;
  used_course_avg: boolean;
};

export type CommentsSummary = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export type CourseData = {
  boilergrades_data?: BoilergradesData;
  rmp_comments?: RmpComment[];
  comments_summary?: CommentsSummary;
  instructorName?: string;
};

export type ScheduleRaterJson = {
  [course: string]: CourseData | number;
  hecticness_final_score: number;
  boilergrades_final_score: number;
  rmp_final_score: number;
  final_score: number;
};

// ============================================================================
// UI Component Types
// ============================================================================

export type ScheduleRow = {
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

export type CrnRow = {
  courseSubject: string;
  courseCode: string;
  courseType: string;
  crnNumber: string;
  instructorName: string;
  credits: string;
};

export type WeightageKey = 'rmp' | 'boilerGrades' | 'hecticness';

export type WeightageConfig = {
  rmp: number;
  boilerGrades: number;
  hecticness: number;
};

// ============================================================================
// Advanced Options Types
// ============================================================================

export type MealTime = {
  start: string;
  end: string;
};

export type AdvancedOptions = {
  breakfast: MealTime;
  lunch: MealTime;
  dinner: MealTime;
  freeTime: MealTime;
  backToBack: string;
};

// ============================================================================
// Parsed Data Types
// ============================================================================

export type ParsedScheduleData = {
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
  allCourses: CourseSummary[];
  _rawCourses: CourseSummary[];
};

export type CourseSummary = {
  courseName: string;
  instructorName: string;
  strengths: string[];
  weaknesses: string[];
  gpa?: number;
  usedCourseAvg?: boolean;
  avgQuality?: number;
  avgDifficulty?: number;
  wouldTakeAgain?: number;
  numReviews?: number;
  summary?: string;
};

// ============================================================================
// Component Props Types
// ============================================================================

export type LocationDropdownProps = {
  value: string;
  onChange: (val: string) => void;
  inputClassName?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

export type DaysDropdownProps = {
  value: string[];
  onChange: (days: string[]) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  dropdownWidthClass?: string;
};

export type InfoIconProps = {
  text: string;
}; 