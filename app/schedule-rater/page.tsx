'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ScheduleRater() {
  const [weightage, setWeightage] = useState({
    rmp: 33.33,
    boilerGrades: 33.33,
    hecticness: 33.34,
  });

  const handleWeightageChange = (category: string, value: number) => {
    setWeightage(prev => ({ ...prev, [category]: value }));
  };

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
          <p className="text-lg text-gray-700">Upload your schedule and get an instant rating based on RMP, Boiler Grades, and schedule intensity.</p>
        </div>
        
        {/* File Upload Section */}
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
              />
            </label>
          </div>
        </div>

        {/* Schedule Editor Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-200">
          <h2 className="text-2xl font-semibold mb-6 text-green-700">Edit Schedule</h2>
          <textarea
            className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all text-gray-800"
            placeholder="Your schedule will appear here after processing..."
          />
        </div>

        {/* Weightage Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-200">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700">Set Weightage</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-lg font-medium text-gray-700">RMP Rating</label>
                <span className="text-lg font-semibold text-cyan-700">{weightage.rmp}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightage.rmp}
                onChange={(e) => handleWeightageChange('rmp', Number(e.target.value))}
                className="w-full h-2 bg-cyan-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-lg font-medium text-gray-700">Boiler Grades</label>
                <span className="text-lg font-semibold text-green-700">{weightage.boilerGrades}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightage.boilerGrades}
                onChange={(e) => handleWeightageChange('boilerGrades', Number(e.target.value))}
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-lg font-medium text-gray-700">Hecticness</label>
                <span className="text-lg font-semibold text-blue-700">{weightage.hecticness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weightage.hecticness}
                onChange={(e) => handleWeightageChange('hecticness', Number(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
          <button
            className="mt-8 w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-500 hover:to-cyan-600 transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-cyan-200 shadow-md"
          >
            Calculate Score
          </button>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-200">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-700">Your Schedule Score</h2>
          <div className="text-6xl font-bold text-center text-cyan-500 mb-4">
            8.5/10
          </div>
          <p className="text-center text-gray-600">Great schedule! Your classes are well-balanced and have good ratings.</p>
        </div>
      </div>
    </div>
  );
}
