'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import React from "react";
import ScheduleScoreDetails from "./ScheduleScoreDetails";
import { createPortal } from 'react-dom';

// Location data as a simple array of strings
const locations = [
  "W19 - 19 Waldron Street",
  "2550 - 2550 Northwestern Avenue",
  "523R - 523 Russell Street",
  "525R - 525 Russell Street",
  "541H - 541 Hayes",
  "844S - 844 South River Road",
  "POTR - A. A. Potter Engineering Center",
  "ADM - Agricultural Innovation Center",
  "AERO - Aerospace Science Lab (Hangar No. 3)",
  "AAPF - Ag Alumni Seed Phenotyping Facility",
  "AGAD - Agricultural Administration Building",
  "ABE - Agricultural and Biological Engineering",
  "AIDC - Agricultural Information Distr Ctr",
  "AEV - Airport Emergency Vehicle Building",
  "ASB - Airport Service Building",
  "ASB1 - Airport Storage Building No. 1",
  "ERHT - Amelia Earhart Residence Hall",
  "RAIL - American Railway Building",
  "AHF - Animal Holding Facility",
  "AR - Armory",
  "HANS - Arthur G. Hansen Life Sciences Res Bldg",
  "AACC - Asian American and Asian Resource and Cultural Center",
  "ADPA - Aspire at Discovery Park Bldg A",
  "ADPB - Aspire at Discovery Park Bldg B",
  "ADPC - Aspire at Discovery Park Bldg C",
  "BIDC - Bechtel Innovation Design Center",
  "BELL - Bell Tower",
  "HARR - Benjamin Harrison Residence Hall",
  "HNLY - Bill and Sally Hanley Hall",
  "BIND - Bindley Bioscience Center",
  "BCHM - Biochemistry Building",
  "BRK - Birck Nanotechnology Center",
  "BCC - Black Cultural Center",
  "BTV - Boiler Television Building",
  "AQUA - Boilermaker Aquatic Center",
  "BLE1 - Bowen Labs Experiment 1",
  "BLE2 - Bowen Labs Experiment 2",
  "BLE3 - Bowen Labs Experiment 3",
  "BLSS - Bowen Labs Storage Shed",
  "BREQ - Brunner Equine Hospital",
  "BRFM - Brunner Farm Animal Hospital",
  "BRUN - Brunner Small Animal Hospital",
  "MRGN - Burton D. Morgan Ctr for Entrepreneurshp",
  "BMSN - Byproduct Material Storage Bldg - North",
  "BMSE - Byproduct Material Storage Building-East",
  "BMSW - Byproduct Material Storage Building-West",
  "CAI - Center for Aging Infrastructure Research Equipment Storage",
  "VCPR - Center for Paralysis Research",
  "CHAF - Chaffee Hall",
  "CHAS - Chaney-Hale Hall of Science",
  "LYNN - Charles J. Lynn Hall of Vet Medicine",
  "CL50 - Class of 1950 Lecture Hall",
  "DMNT - Clayton W. Dement Fire Station",
  "COAL - Coal Handling Control/Fire Pump Bldg",
  "ZL1 - Combustion Research Laboratory",
  "COMP - Composites Laboratory",
  "CONV - Convergence Ctre for Innov & Coll",
  "CTEB - Cooling Tower Equipment Building",
  "DAT1 - Data Center 1",
  "PFEN - David C. Pfendler Hall of Agriculture",
  "HAMP - Delon and Elizabeth Hampton Hall of Civil Engineering",
  "SCHW - Dennis J. & Mary Lou Schwartz Tennis Ctr",
  "DAUC - Dick & Sandy Dauch Alumni Center",
  "BRES - Drew and Brittany Brees Student-Athlete Academic Center",
  "DRUG - Drug Discovery",
  "DUDL - Dudley Hall",
  "ELLT - Edward C. Elliott Hall of Music",
  "SHRV - Eleanor B. Shreve Residence Hall",
  "WOOD - Elizabeth G. & William R. Wood Res Hall",
  "EEL - Entomology Environmental Lab",
  "EHSA - Equine Health Sciences Annex",
  "EHSB - Equine Health Sciences Building",
  "YONG - Ernest C. Young Hall",
  "VAWT - Everett B. Vawter Residence Hall",
  "HAAS - Felix Haas Hall",
  "FSTC - First Street Towers Central",
  "FSTE - First Street Towers East",
  "FSTW - First Street Towers West",
  "FLEX - Flex Lab",
  "FOPN - Flight Operations Building",
  "FPRD - Forest Products Building",
  "FORS - Forestry Building",
  "FRNY - Forney Hall of Chemical Engineering",
  "CREC - France A. Córdova Recreational Sports Center",
  "SHLY - Frances M. Shealy Residence Hall",
  "CQE - Franklin Levering Cary Quadrangle (East)",
  "CQNE - Franklin Levering Cary Quadrangle (NE)",
  "CQNW - Franklin Levering Cary Quadrangle (NW)",
  "CQW - Franklin Levering Cary Quadrangle (West)",
  "CQS - Franklin Levering Cary Quadrangle(South)",
  "FORD - Fred and Mary Ford Dining Court",
  "HOVD - Frederick L. Hovde Hall of Admin",
  "PKRF - Frieda Parker Residence Hall",
  "ZL6 - Fuel Conditioning Building",
  "ZL2 - Gas Dynamics Research Laboratory",
  "GAS - Gas Meter-at Airport",
  "HAWK - George A. Hawkins Hall",
  "MANN - Gerald D. and Edna E. Mann Hall",
  "GCMB - Golf Course Maintenance Barn",
  "GSMB - Golf Storage Maintenance Barn",
  "PRIX - Grand Prix Track Restroom Facility",
  "G333 - Grant 333",
  "PGG - Grant Street Parking Garage",
  "GRVL - Gravel Pit Equipment Storage Building",
  "GRIS - Grissom Hall",
  "GMF - Grounds Maintenance Facility",
  "GMGF - Grounds Maintenance Greenhouse Facility",
  "GMPS - Grounds Maintenance Pesticide Storage Facility",
  "MACK - Guy J. Mackey Arena",
  "DLR - Hall for Discovery and Learning Research",
  "DSAI - Hall of Data Science and AI",
  "HGR4 - Hangar No. 4",
  "HGR5 - Hangar No. 5",
  "HGR6 - Hangar No. 6",
  "HGR8 - Hangar No. 8",
  "FWLR - Harriet O. & James M. Fowler Jr. Mem Hse",
  "PGH - Harrison Street Parking Garage",
  "WILY - Harvey W. Wiley Residence Hall",
  "HMMT - Hazardous Materials Management Trailer",
  "HESB - Heavy Equipment Storage Building",
  "SCHM - Helen B. Schleman Hall",
  "JNSN - Helen R. Johnson Hall of Nursing",
  "BRWN - Herbert C. Brown Laboratory of Chemistry",
  "HERL - Herrick Acoustics",
  "HLAB - Herrick Laboratories",
  "ZL8 - High Pressure Combustion Laboratory",
  "ZL3 - High Pressure Research Laboratory",
  "HILL - Hillenbrand Residence Hall",
  "HA01 - Hilltop Apartment 1",
  "HA10 - Hilltop Apartment 10",
  "HA11 - Hilltop Apartment 11",
  "HA12 - Hilltop Apartment 12",
  "HA13 - Hilltop Apartment 13",
  "HA14 - Hilltop Apartment 14",
  "HA15 - Hilltop Apartment 15",
  "HA16 - Hilltop Apartment 16",
  "HA17 - Hilltop Apartment 17",
  "HA18 - Hilltop Apartment 18",
  "HA19 - Hilltop Apartment 19",
  "HA02 - Hilltop Apartment 2",
  "HA20 - Hilltop Apartment 20",
  "HA21 - Hilltop Apartment 21",
  "HA22 - Hilltop Apartment 22",
  "HA23 - Hilltop Apartment 23",
  "HA24 - Hilltop Apartment 24",
  "HA25 - Hilltop Apartment 25",
  "HA26 - Hilltop Apartment 26",
  "HA27 - Hilltop Apartment 27",
  "HA28 - Hilltop Apartment 28",
  "HA29 - Hilltop Apartment 29",
  "HA03 - Hilltop Apartment 3",
  "HA30 - Hilltop Apartment 30",
  "HA31 - Hilltop Apartment 31",
  "HA32 - Hilltop Apartment 32",
  "HA04 - Hilltop Apartment 4",
  "HA05 - Hilltop Apartment 5",
  "HA06 - Hilltop Apartment 6",
  "HA07 - Hilltop Apartment 7",
  "HA08 - Hilltop Apartment 8",
  "HA09 - Hilltop Apartment 9",
  "CRTN - Hobart and Russell Creighton Hall of Animal Sciences",
  "SIML - Holleman-Niswonger Simulator Center",
  "HCRN - Honors College and Residences North",
  "HCRS - Honors College and Residences South",
  "HGRH - Horticultural Greenhouse",
  "HORT - Horticulture Building",
  "HRTP - Horticulture Park Barn",
  "HULL - Hull All-American Marching Band",
  "HARF - Hypersonics and Applied Research Facility",
  "IMI - Indiana Manufacturing Institute - IMI",
  "INOK - INOK Investments Warehouse",
  "TURF - Intercollegiate Athletic Sports Turf Bdg",
  "INSS - Intramural Storage Shed",
  "RAWL - Jerry S. Rawls Hall",
  "SMLY - John C. Smalley Ctr For Hsg & Fd Srv Adm",
  "WRIT - John S. Wright Forestry Center",
  "MCUT - John T. McCutcheon Residence Hall",
  "HIKS - John W. Hicks Undergraduate Library",
  "KPNR - Kepner Building",
  "KFPC - Kozuch Football Performance Center",
  "KRCH - Krach Leadership Center",
  "KRAN - Krannert Building",
  "KPTC - Kurz Purdue Technology Center",
  "LMSA - Laboratory Materials Storage Annex",
  "LMSB - Laboratory Materials Storage Building",
  "LMST - Laboratory Materials Storage Trailer",
  "LG - Lambert Green Dining",
  "LMBS - Lambertus Hall",
  "LOLC - Land O Lakes Center for Experiential Learning and Purina Pav",
  "LCCP - Latino Cultural Center at Purdue",
  "DOYL - Leo Philip Doyle Laboratory",
  "LSA - Life Science Animal Building",
  "LSPS - Life Science Plant and Soils Laboratory",
  "LSR - Life Science Ranges",
  "LILY - Lilly Hall of Life Sciences",
  "LINS - Line Shack (at Airport)",
  "LYLE - Lyles-Porter Hall",
  "HAGL - Marc and Sharon Hagle Hall",
  "MRRT - Marriott Hall",
  "WARN - Martha E. & Eugene K. Warren Resid Hall",
  "MJIS - Martin C. Jischke Hall of Biomedical Eng",
  "MSEE - Materials and Electrical Engineering",
  "MMDC - Materials Management & Distribution Ctr",
  "MMS1 - Materials Management Storage Building 1",
  "MMS2 - Materials Management Storage Building 2",
  "MMS3 - Materials Management Storage Building 3",
  "MATH - Mathematical Sciences Building",
  "MTHW - Matthews Hall",
  "KNOY - Maurice G. Knoy Hall of Technology",
  "BHEE - Max W & Maileen Brown Family Hall",
  "PGMD - McCutcheon Drive Parking Garage",
  "ME - Mechanical Engineering Building",
  "OLMN - Melvin L. Ollman Golf Cart Barn",
  "MRDS - Meredith Residence Hall South",
  "MOLL - Mollenkopf Athletic Center",
  "NACC - Native American Educational and Cultural Center",
  "ARMS - Neil Armstrong Hall of Engineering",
  "TARK - Newton Booth Tarkington Residence Hall",
  "NISW - Niswonger Aviation Technology Building",
  "NWSS - Northwest Campus Substation",
  "NWCP - Northwest Chiller Plant",
  "NWSB - Northwest Storage Barn",
  "PGNW - Northwestern Avenue Parking Garage",
  "TER1 - Oliver Perkins Terry Garage",
  "TERY - Oliver Perkins Terry House",
  "DUHM - Ophelia Duhme Residence Hall",
  "PJEC - Patty Jischke Early Care & Ed Ctr",
  "PRCE - Peirce Hall",
  "PEST - Pesticide Applicator Training Facility",
  "DYE - Pete Dye Clubhouse",
  "NLSN - Philip E. Nelson Hall of Food Science",
  "PFSB - Physical Facilities Service Building",
  "PHYS - Physics Building",
  "PRSV - Printing Services Facility",
  "ZL4 - Propulsion Research Laboratory",
  "PSYC - Psychological Sciences Building",
  "BBCH - Purdue Baseball Clubhouse",
  "BBPB - Purdue Baseball Press Box",
  "BOAT - Purdue Crew Boathouse",
  "PGSC - Purdue Graduate Student Center",
  "TRE1 - Purdue Grounds",
  "PIT1 - Purdue International Teleport Bldg 1",
  "PMRI - Purdue Magnetic Resonance Imagin",
  "PMU - Purdue Memorial Union",
  "PMUC - Purdue Memorial Union Club",
  "520F - Purdue Musical Organization Warehouse",
  "SBCH - Purdue Softball Clubhouse",
  "SBPB - Purdue Softball Press Box",
  "PSF - Purdue Student Farm",
  "PTC - Purdue Technology Center",
  "ECEC - Purdue University Early Care and Education Center",
  "PUSH - Purdue University Student Health Center",
  "PVAB - Purdue Village Administration Building",
  "PWB - Purdue West - Building B",
  "PWC - Purdue West - Building C",
  "PWF - Purdue West - Building F",
  "SOCC - Purdue Womens Soccer Building",
  "REMS - Radiological & Environ Mgmt Storage Bldg",
  "BALY - Ralph and Bettye Bailey Hall",
  "LWSN - Richard & Patricia Lawson Cmptr Sci Bldg",
  "WTHR - Richard Benbridge Wetherill Lab of Chem",
  "OWEN - Richard Owen Residence Hall",
  "RHPH - Robert E. Heine Pharmacy Building",
  "BOWN - Robert L. & Terry L. Bowen Laboratory",
  "RAD - Ross-Ade Dining",
  "STDM - Ross-Ade Stadium",
  "RALR - Ross-Ade Stadium Locker Room",
  "WSLR - Roy L. Whistler Hall of Agricultural Rsh",
  "R414 - Russell 414",
  "SLT - Salt Storage Building",
  "VOIN - Samuel Voinoff Golf Pavillion",
  "SCHO - Schowe House",
  "SSWA - Self Storage Warehouse A",
  "SSWB - Self Storage Warehouse B",
  "SSWC - Self Storage Warehouse C",
  "WANG - Seng-Liang Wang Hall",
  "SCPA - Slayter Center of Performing Arts",
  "SMTH - Smith Hall",
  "SC - Stanley Coulter Hall",
  "S410 - Steely 410",
  "BRNG - Steven C. Beering Hall of Lib Arts & Ed",
  "STEW - Stewart Center",
  "SFOF - Swift Fuels Operations Facility",
  "TH-1 - Tee-Hangar No. 1",
  "TH-2 - Tee-Hangar No. 2",
  "TH-3 - Tee-Hangar No. 3",
  "TH-4 - Tee-Hangar No. 4",
  "TH-5 - Tee-Hangar No. 5",
  "TH-6 - Tee-Hangar No. 6",
  "TH-7 - Tee-Hangar No. 7",
  "TEL - Telecommunications Building",
  "TERM - Terminal Building (Hangar No. 2)",
  "PAGE - Thomas A. Page Pavilion",
  "WALC - Thomas S. and Harvey D. Wilmeth Active Learning Center",
  "SPUR - Tom Spurgeon Golf Training Center",
  "TPB - Track Press Box",
  "TTS - Track Toilet + Storage Building",
  "TRAM - Transmitter Building WBAA Radio AM",
  "TRFM - Transmitter Building WBAA Radio FM",
  "TSWF - Transportation Service Wash Facility",
  "TREE - Tree Nursery Service Building",
  "ZL5 - Turbomachinery Fluid Dynamics Laboratory",
  "TREC - Turf Recreation Exercise Center",
  "SAT - Univ Residence Halls Satellite Tran Bldg",
  "UC - University Church",
  "UNIV - University Hall",
  "PGU - University Street Parking Garage",
  "UPOB - Utility Plant Office Building",
  "UPOF - Utility Plant Office Facility",
  "UPSB - Utility Plant Storage Building",
  "VPRB - Vet. Pathobiology Research Building",
  "VA1 - Veterinary Animal Isolation Bldg 1",
  "VA2 - Veterinary Animal Isolation Bldg 2",
  "VLAB - Veterinary Laboratory Animal Building",
  "VMIF - Veterinary Medicine Isolation Facility",
  "VPTH - Veterinary Pathology Building",
  "MRDH - Virginia C. Meredith Residence Hall",
  "VULC - Vulcan Building",
  "WALD - Waldron 125",
  "WSAN - Waldron Square Apartments North",
  "WSAS - Waldron Square Apartments South",
  "WADE - Walter W. Wade Utility Plant",
  "LAMB - Ward L. Lambert Field House & Gymnasium",
  "HOCK - Wayne T & Mary T Hockmeyer Hall Strc Bio",
  "WH-2 - Well House No. 2",
  "WH-4 - Well House No. 4",
  "WH-5 - Well House No. 5",
  "WH-6 - Well House No. 6",
  "WH-7 - Well House No. 7",
  "WH-8 - Well House No. 8",
  "WH-9 - Well House No. 9",
  "WEST - Westwood",
  "WWG - Westwood Garage",
  "WDCT - Wiley Dining Court",
  "DANL - William H. Daniel Turfgrass Rsch&Diag Ct",
  "ADDL - Willie M. Reed Animal Disease Diagnostic Laboratory",
  "PKRW - Winifred Parker Residence Hall",
  "STON - Winthrop E. Stone Hall",
  "WGLR - Womens Golf Locker Room",
  "PGW - Wood Street Parking Garage",
  "PAO - Yue-Kong Pao Hall of Visual & Perf Arts",
  "ZS01 - Zucrow Storage Shed 1",
  "ZS10 - Zucrow Storage Shed 10",
  "ZS04 - Zucrow Storage Shed 4",
  "ZS09 - Zucrow Storage Shed 9"
];

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
type LocationDropdownProps = { value: string; onChange: (val: string) => void; inputClassName?: string; open: boolean; setOpen: (open: boolean) => void; inputRef: React.RefObject<HTMLInputElement> };
function LocationDropdown({ value, onChange, inputClassName = '', open, setOpen, inputRef }: LocationDropdownProps) {
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const filtered = locations.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open && inputRef && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ left: rect.left, top: rect.bottom + 6, width: rect.width });
    } else {
      setDropdownPos(null);
    }
  }, [open, inputRef]);

  useEffect(() => {
    if (open && highlighted >= 0 && highlighted < filtered.length) {
      const el = document.getElementById(`location-option-${highlighted}`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, open, filtered.length]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 text-xs sm:text-sm h-10 ${inputClassName}`}
        value={open ? search : value}
        onFocus={() => { setOpen(true); setSearch(value); setHighlighted(-1); }}
        onChange={e => { setSearch(e.target.value); setOpen(true); setHighlighted(0); }}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder="Search location"
        onKeyDown={e => {
          if (!open) return;
          if (e.key === 'ArrowDown') {
            setHighlighted(h => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === 'ArrowUp') {
            setHighlighted(h => Math.max(h - 1, 0));
          } else if (e.key === 'Enter' && highlighted >= 0 && highlighted < filtered.length) {
            onChange(filtered[highlighted]);
            setSearch(filtered[highlighted]);
            setOpen(false);
            inputRef.current?.blur();
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        autoComplete="off"
      />
      {open && dropdownPos && createPortal(
        <div
          className="z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl max-h-48 overflow-y-auto animate-fade-in transition-all duration-200"
          style={{ position: 'fixed', left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width, transformOrigin: 'top' }}
        >
          {filtered.length === 0 && <div className="p-2 text-gray-400">No results</div>}
          {filtered.map((name, idx) => (
            <div
              id={`location-option-${idx}`}
              key={name}
              className={`px-3 py-2 cursor-pointer text-xs sm:text-sm transition-colors ${idx === highlighted ? 'bg-cyan-100 text-cyan-900' : 'hover:bg-cyan-50'}`}
              onMouseDown={() => { onChange(name); setSearch(name); setOpen(false); }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              {name}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// Helper for days multi-select
const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type DaysDropdownProps = { value: string[]; onChange: (days: string[]) => void; open?: boolean; setOpen?: (open: boolean) => void };
function DaysDropdown({ value, onChange, dropdownWidthClass = 'w-32', open: controlledOpen, setOpen: setControlledOpen }: DaysDropdownProps & { dropdownWidthClass?: string }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{left: number, top: number, width: number} | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({ left: rect.left, top: rect.bottom + 6, width: rect.width });
      }
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      setDropdownPos(null);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);
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
      {open && dropdownPos && createPortal(
        <div
          className={`z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl p-3 min-w-[140px] ${dropdownWidthClass} overflow-hidden transition-all duration-200 animate-fade-in`}
          style={{ position: 'fixed', left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width, transformOrigin: 'top' }}
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
      )}
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
  const locationInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isTimeDropdownHovered, setIsTimeDropdownHovered] = useState(false);

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
    function handleScrollOrResize() {
      // Only close time dropdown if not hovered
      if (!(openDropdown && openDropdown.type === 'time' && isTimeDropdownHovered)) {
        setOpenDropdown(null);
      }
    }
    if (openDaysDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openDaysDropdown, isTimeDropdownHovered]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    function handleScrollOrResize() {
      // Only close time dropdown if not hovered
      if (!(openDropdown && openDropdown.type === 'time' && isTimeDropdownHovered)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openDropdown, isTimeDropdownHovered]);

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
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10 border border-green-200 w-full max-w-[1400px] min-w-[900px] mx-auto transition-all flex flex-col items-center justify-center">
              <div className="flex items-center justify-between mb-4 w-full">
                <h2 className="text-3xl font-extrabold text-green-700 tracking-tight">Edit Schedule</h2>
                <span className="text-gray-500 text-base font-medium">Add, edit, or remove your classes below.</span>
              </div>
              {/* Table wrapper with minimal spacing, centered */}
              <div className="w-full relative flex flex-col items-center justify-center">
                <div className="relative w-full">
                  <div className="grid grid-cols-12 gap-x-2 items-center w-full text-sm mb-2 bg-gradient-to-r from-green-100 via-cyan-50 to-blue-100 rounded-2xl shadow-sm border border-green-100 px-2">
                    <div className="col-span-1 font-bold text-center flex justify-center items-center py-2 rounded-tl-2xl text-green-900">Subj</div>
                    <div className="col-span-1 font-bold text-center flex justify-center items-center py-2 text-green-900">Code</div>
                    <div className="col-span-1.5 font-bold text-center flex justify-center items-center py-2 text-green-900">Type</div>
                    <div className="col-span-1 font-bold text-center flex justify-center items-center py-2 text-green-900">Days</div>
                    <div className="col-span-1.5 font-bold text-center flex justify-center items-center py-2 text-green-900">Start</div>
                    <div className="col-span-1.5 font-bold text-center flex justify-center items-center py-2 text-green-900">End</div>
                    <div className="col-span-2 font-bold text-center flex justify-center items-center py-2 text-green-900">Loc</div>
                    <div className="col-span-2 font-bold text-center flex justify-center items-center py-2 text-green-900">Instr</div>
                    <div className="col-span-1 font-bold text-center flex justify-center items-center py-2 text-green-900">Cr</div>
                    <div className="col-span-1 font-bold text-center flex justify-center items-center py-2 rounded-tr-2xl text-green-900">❌</div>
                  </div>
                {schedule.map((row, idx) => (
                  <div
                    className={`grid grid-cols-12 gap-x-2 w-full mb-2 py-2 text-sm rounded-xl transition-all duration-150 px-2 ${idx % 2 === 1 ? 'bg-gradient-to-r from-green-50 via-cyan-50 to-blue-50' : 'bg-white'} hover:shadow-md hover:scale-[1.01] relative z-0 items-center`}
                    key={idx}
                  >
                    <div className="col-span-1 flex justify-center"><input type="text" className="w-full min-w-[48px] h-10 border border-gray-200 rounded-lg px-2 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold transition-all" value={row.courseSubject} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseSubject = e.target.value; setSchedule(newSchedule); }} placeholder="Subj" /></div>
                    <div className="col-span-1 flex justify-center"><input type="text" className="w-full min-w-[48px] h-10 border border-gray-200 rounded-lg px-2 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold transition-all" value={row.courseCode} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseCode = e.target.value; setSchedule(newSchedule); }} placeholder="Code" /></div>
                    <div className="col-span-1.5 flex justify-center"><input type="text" className="w-full min-w-[60px] h-10 border border-gray-200 rounded-lg px-2 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold transition-all" value={row.courseType} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].courseType = e.target.value; setSchedule(newSchedule); }} placeholder="Type" /></div>
                    <div className="col-span-1 flex justify-center"><DaysDropdown value={row.courseDays} onChange={(days: string[]) => { const newSchedule = [...schedule]; newSchedule[idx].courseDays = days; setSchedule(newSchedule); }} dropdownWidthClass="w-16" open={!!(openDropdown && openDropdown.type === 'days' && openDropdown.row === idx)} setOpen={(open: boolean) => setOpenDropdown(open ? { type: 'days', row: idx } : null)} /></div>
                    <div className="col-span-1.5 flex justify-center"><button ref={el => { startBtnRefs[idx] = el; }} type="button" className="w-full min-w-[70px] h-10 border border-gray-200 rounded-lg px-2 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-400 font-semibold transition-all text-base" onClick={() => setOpenDropdown(openDropdown && openDropdown.type === 'time' && openDropdown.row === idx ? null : { type: 'time', row: idx, field: 'start'})}>{row.courseTime.start || 'Start'}</button>{openDropdown && openDropdown.type === 'time' && openDropdown.row === idx && openDropdown.field === 'start' && startBtnRefs[idx] && createPortal((() => {
                      const rect = startBtnRefs[idx].getBoundingClientRect();
                      return (
                        <div className="z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl p-2 min-w-[100px] max-h-60 overflow-y-auto animate-fade-in transition-all duration-200" style={{ position: 'fixed', left: rect.left, top: rect.bottom + 6, width: rect.width, transformOrigin: 'top' }}
                          onMouseEnter={() => setIsTimeDropdownHovered(true)}
                          onMouseLeave={() => setIsTimeDropdownHovered(false)}
                        >
                          {timeOptions.map((time) => (<div key={time} className="px-3 py-2 cursor-pointer hover:bg-cyan-50 text-sm text-gray-700" onClick={() => { const newSchedule = [...schedule]; newSchedule[idx].courseTime.start = time; setSchedule(newSchedule); setOpenDropdown(null); }}>{time}</div>))}
                        </div>
                      );
                    })(), document.body)}</div>
                    <div className="col-span-1.5 flex justify-center"><button ref={el => { endBtnRefs[idx] = el; }} type="button" className="w-full min-w-[70px] h-10 border border-gray-200 rounded-lg px-2 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-400 font-semibold transition-all text-base" onClick={() => setOpenDropdown(openDropdown && openDropdown.type === 'time' && openDropdown.row === idx ? null : { type: 'time', row: idx, field: 'end'})}>{row.courseTime.end || 'End'}</button>{openDropdown && openDropdown.type === 'time' && openDropdown.row === idx && openDropdown.field === 'end' && endBtnRefs[idx] && createPortal((() => {
                      const rect = endBtnRefs[idx].getBoundingClientRect();
                      return (
                        <div className="z-[9999] bg-white border border-cyan-200 shadow-2xl rounded-xl p-2 min-w-[100px] max-h-60 overflow-y-auto animate-fade-in transition-all duration-200" style={{ position: 'fixed', left: rect.left, top: rect.bottom + 6, width: rect.width, transformOrigin: 'top' }}
                          onMouseEnter={() => setIsTimeDropdownHovered(true)}
                          onMouseLeave={() => setIsTimeDropdownHovered(false)}
                        >
                          {timeOptions.map((time) => (<div key={time} className="px-3 py-2 cursor-pointer hover:bg-cyan-50 text-sm text-gray-700" onClick={() => { const newSchedule = [...schedule]; newSchedule[idx].courseTime.end = time; setSchedule(newSchedule); setOpenDropdown(null); }}>{time}</div>))}
                        </div>
                      );
                    })(), document.body)}</div>
                    <div className="col-span-2 flex justify-center"><LocationDropdown value={row.courseLocation} onChange={(loc: string) => { const newSchedule = [...schedule]; newSchedule[idx].courseLocation = loc; setSchedule(newSchedule); }} inputClassName="w-full min-w-[80px] h-10 px-2 py-1 overflow-x-auto resize-x border border-gray-200 rounded-lg transition-all" open={!!(openDropdown && openDropdown.type === 'location' && openDropdown.row === idx)} setOpen={open => setOpenDropdown(open ? { type: 'location', row: idx } : null)} inputRef={el => { locationInputRefs.current[idx] = el; }} /></div>
                    <div className="col-span-2 flex justify-center"><input type="text" className="w-full min-w-[60px] h-10 border border-gray-200 rounded-lg px-2 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold transition-all" value={row.instructorName} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].instructorName = e.target.value; setSchedule(newSchedule); }} placeholder="Instr" /></div>
                    <div className="col-span-1 flex justify-center"><input type="number" min="0" className="w-full min-w-[32px] h-10 border border-gray-200 rounded-lg px-1 py-1 text-center bg-white focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-300 font-semibold transition-all" value={row.credits} onChange={e => { const newSchedule = [...schedule]; newSchedule[idx].credits = e.target.value.replace(/[^0-9]/g, ''); setSchedule(newSchedule); }} placeholder="Cr" /></div>
                    <div className="col-span-1 flex justify-center"><button className="text-red-500 hover:text-red-700 font-bold px-2 text-xl transition-all" onClick={() => { setSchedule(schedule.filter((_, i) => i !== idx)); }} aria-label="Delete row">❌</button></div>
                  </div>
                ))}
              </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-gradient-to-r from-green-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md hover:from-green-600 hover:to-cyan-600 transform transition-all hover:scale-105 flex items-center gap-2"
                  onClick={() => setSchedule([...schedule, initialScheduleRow])}
                >
                  <span className="text-2xl">＋</span> Add Class
                </button>
              </div>
              <div className="text-gray-400 text-sm mt-3 text-right font-medium">Tip: Double-click a field to edit.</div>
            </div>
            {/* Weightage Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-200">
              <div className="flex flex-col mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Set Weightage</h2>
                <p className="text-gray-600 text-base mt-2 max-w-2xl">
                  Adjust the sliders to set how much each factor (professor ratings, grade outcomes, and schedule hecticness) matters to you. Your final schedule score will reflect your personal priorities, helping you find the best fit for your needs.
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700 flex items-center">RMP Rating <InfoIcon text="Based on student reviews from RateMyProfessor.com, this score reflects professor quality, clarity, helpfulness, and teaching style." /></label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        value={weightage.rmp}
                        onChange={e => handleWeightageChange('rmp', Number(e.target.value))}
                        className="w-80 h-2 bg-cyan-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                      <span className="w-10 text-center text-lg font-semibold text-cyan-700">{weightage.rmp}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700 flex items-center">Boiler Grades <InfoIcon text="Reflects the average GPA students have earned in these class over recent semesters." /></label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        value={weightage.boilerGrades}
                        onChange={e => handleWeightageChange('boilerGrades', Number(e.target.value))}
                        className="w-80 h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <span className="w-10 text-center text-lg font-semibold text-green-700">{weightage.boilerGrades}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 items-center">
                    <label className="text-lg font-medium text-gray-700 flex items-center">Hecticness <InfoIcon text="Reflects how evenly (or unevenly) your classes are spread out — the more bunched up, the higher the hecticness." /></label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        value={weightage.hecticness}
                        onChange={e => handleWeightageChange('hecticness', Number(e.target.value))}
                        className="w-80 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="w-10 text-center text-lg font-semibold text-blue-700">{weightage.hecticness}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="mt-8 w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-500 hover:to-cyan-600 transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-cyan-200 shadow-md"
                onClick={() => {
                  const sum = weightage.rmp + weightage.boilerGrades + weightage.hecticness;
                    setFinalScore(calculateFinalScore(weightage, parsed));
                }}
              >
                Calculate Score
              </button>
            </div>
          </>
        )}

        {/* Score Display */}
        {finalScore !== null && (
          <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-cyan-100 mt-8 max-w-[110vw] w-full mx-auto flex flex-col items-center">
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
