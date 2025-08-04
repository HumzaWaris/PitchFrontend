/**
 * File Upload Component
 * Handles schedule image upload with drag-and-drop functionality
 */

import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onGenerateSchedule: () => void;
  scheduleUploaded: boolean;
}

export default function FileUpload({
  onFileSelect,
  selectedFile,
  onGenerateSchedule,
  scheduleUploaded
}: FileUploadProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-cyan-200">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-700">Upload Schedule</h2>
      
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-cyan-400 rounded-xl cursor-pointer bg-cyan-50 hover:bg-cyan-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg 
              className="w-12 h-12 mb-4 text-cyan-500" 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 20 16"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
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
                onFileSelect(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>
      
      {scheduleUploaded && (
        <button
          className="mt-6 w-full bg-gradient-to-r from-green-400 to-cyan-500 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-500 hover:to-cyan-600 transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-cyan-200 shadow-md"
          onClick={onGenerateSchedule}
        >
          Generate Schedule
        </button>
      )}
    </div>
  );
} 