/**
 * Data processing utilities for the Schedule Rater
 * Handles parsing, calculations, and data transformations
 */

import { ScheduleRaterJson, ParsedScheduleData, CourseData, CourseSummary } from '../types';

/**
 * Parses the raw schedule rater JSON response into a structured format
 * @param data - Raw JSON response from the backend
 * @returns Parsed and processed schedule data
 */
export function parseScheduleRaterJson(data: ScheduleRaterJson): ParsedScheduleData {
  // Extract base scores
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

  // Find class with lowest average GPA
  const { lowestGpaCourse, lowestGpa } = findLowestGpaCourse(courseEntries);

  // Find class with lowest average RMP rating
  const { lowestRmpCourse, lowestRmp } = findLowestRmpCourse(courseEntries);

  // Find most difficult class (highest avg difficulty)
  const { hardestCourse, highestDifficulty } = findHardestCourse(courseEntries);

  // Find most loved class (% would take again)
  const { mostLovedCourse, highestWouldTakeAgain } = findMostLovedCourse(courseEntries);

  // Find class with most RMP reviews
  const { mostReviewedCourse, mostReviews } = findMostReviewedCourse(courseEntries);

  // Build allCourses array for strengths/weaknesses
  const allCourses = courseEntries.map(([course, courseData]) => ({
    courseName: course,
    instructorName: (courseData as any).instructorName || '',
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
    summaryCourse: null,
    summaryStrength: null,
    summaryWeakness: null,
    allCourses,
    _rawCourses: allCourses, // Add this for UI use
  };
}

/**
 * Finds the course with the lowest average GPA
 */
function findLowestGpaCourse(courseEntries: [string, CourseData][]) {
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

  return { lowestGpaCourse, lowestGpa };
}

/**
 * Finds the course with the lowest average RMP rating
 */
function findLowestRmpCourse(courseEntries: [string, CourseData][]) {
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

  return { lowestRmpCourse, lowestRmp };
}

/**
 * Finds the most difficult course (highest average difficulty)
 */
function findHardestCourse(courseEntries: [string, CourseData][]) {
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

  return { hardestCourse, highestDifficulty };
}

/**
 * Finds the most loved course (% would take again)
 */
function findMostLovedCourse(courseEntries: [string, CourseData][]) {
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

  return { mostLovedCourse, highestWouldTakeAgain };
}

/**
 * Finds the course with the most RMP reviews
 */
function findMostReviewedCourse(courseEntries: [string, CourseData][]) {
  let mostReviewedCourse = null;
  let mostReviews = -Infinity;
  
  courseEntries.forEach(([course, courseData]) => {
    if (courseData.rmp_comments && courseData.rmp_comments.length > mostReviews) {
      mostReviews = courseData.rmp_comments.length;
      mostReviewedCourse = course;
    }
  });

  return { mostReviewedCourse, mostReviews };
}

/**
 * Calculates the final score based on weightage and individual scores
 * @param weightage - User-defined weightage configuration
 * @param parsed - Parsed schedule data
 * @returns Calculated final score
 */
export function calculateFinalScore(
  weightage: { rmp: number; boilerGrades: number; hecticness: number }, 
  parsed: ParsedScheduleData
): number {
  const totalWeight = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
  if (totalWeight === 0) return 0;
  
  return (
    (parsed.rmpScore * weightage.rmp +
      parsed.boilergradesScore * weightage.boilerGrades +
      parsed.hecticnessScore * weightage.hecticness) /
    totalWeight
  ) * 10; // Scale to 10 for display
}

/**
 * Validates that weightage values sum to 100
 * @param weightage - Weightage configuration to validate
 * @returns True if valid, false otherwise
 */
export function validateWeightage(weightage: { rmp: number; boilerGrades: number; hecticness: number }): boolean {
  const sum = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
  return sum === 100;
} 