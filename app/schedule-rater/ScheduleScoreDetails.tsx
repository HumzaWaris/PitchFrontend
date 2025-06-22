import React from "react";

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
};

const ScoreCircle: React.FC<{ label: string; value: number | null; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col items-center mx-4">
    <div
      className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg mb-2 border-4 ${color}`}
      style={{ background: 'white' }}
    >
      <span className="text-3xl font-bold text-gray-800">{value !== null ? value : 'N/A'}</span>
    </div>
    <div className="text-lg font-semibold text-gray-700 text-center">{label}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <span className="font-medium text-gray-700">{label}</span>
    <span className="font-semibold text-cyan-700">{value ?? "N/A"}</span>
  </div>
);

const ScheduleScoreDetails: React.FC<Props> = ({ data }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-200 mt-8">
    <h2 className="text-2xl font-semibold mb-6 text-cyan-700 text-center">Schedule Analysis</h2>
    {/* Circles Row */}
    <div className="flex flex-row justify-center items-center mb-8 gap-8">
      <ScoreCircle label="Hecticness" value={data.hecticnessScore} color="border-blue-400" />
      <ScoreCircle label="RMP" value={data.rmpScore} color="border-cyan-400" />
      <ScoreCircle label="BoilerGrades" value={data.boilergradesScore} color="border-green-400" />
    </div>
    {/* Info List */}
    <div className="max-w-xl mx-auto mt-6 space-y-2">
      <InfoRow
        label="Class with Lowest Avg GPA"
        value={data.lowestGpaCourse ? `${data.lowestGpaCourse} (GPA: ${data.lowestGpa})` : "N/A"}
      />
      <InfoRow
        label="Class with Lowest Avg RMP Rating"
        value={data.lowestRmpCourse ? `${data.lowestRmpCourse} (${data.lowestRmp})` : "N/A"}
      />
      <InfoRow
        label="Most Difficult Class"
        value={data.hardestCourse ? `${data.hardestCourse} (Difficulty: ${data.highestDifficulty}/5)` : "N/A"}
      />
      <InfoRow
        label="Most Loved Class (% Would Take Again)"
        value={data.mostLovedCourse ? `${data.mostLovedCourse} (${data.highestWouldTakeAgain}%)` : "N/A"}
      />
      <InfoRow
        label="Class with Most RMP Reviews"
        value={data.mostReviewedCourse ? `${data.mostReviewedCourse} (${data.mostReviews})` : "N/A"}
      />
    </div>
  </div>
);

export default ScheduleScoreDetails; 