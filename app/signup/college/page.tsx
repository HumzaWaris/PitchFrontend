"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectCollegePage() {
  const [selectedCollege, setSelectedCollege] = useState("Purdue University");
  const router = useRouter();

  const handleNext = () => {
    router.push(`/signup/email?college=${encodeURIComponent(selectedCollege)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        <button 
          onClick={() => router.back()} 
          className="text-black text-sm mb-4"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Select Your College.
        </h1>

        <select
          className="w-full mb-6 border border-gray-300 rounded-md p-3 bg-gray-100 text-black focus:outline-none"
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
        >
          <option value="Purdue University">Purdue University</option>
          <option value="Indiana University">Indiana University</option>
        </select>

        <button
          onClick={handleNext}
          className="w-full py-3 rounded-md bg-purple-500 text-white font-semibold hover:bg-purple-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
