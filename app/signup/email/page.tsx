"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EnterEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve college from query parameters (default to "Purdue University")
  const [college] = useState(searchParams.get("college") || "Purdue University");
  const [email, setEmail] = useState("");

  // When user clicks "Next", navigate to create-account page with email and college as query parameters.
  const handleNext = () => {
    router.push(
      `/signup/create-account?college=${encodeURIComponent(college)}&email=${encodeURIComponent(email)}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        {/* Back button */}
        <button 
          onClick={() => router.back()} 
          className="text-black text-sm mb-4"
        >
          &larr; Back
        </button>
        {/* Page heading */}
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          What's your email?
        </h1>
        {/* Email input field styled similarly to the select in the college page */}
        <input
          type="email"
          placeholder="Enter your university email"
          className="w-full p-3 mb-6 border border-gray-300 rounded-md bg-gray-100 text-black focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Next button styled as a purple button with white text */}
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-md bg-purple-500 text-white font-semibold hover:bg-purple-600"
        >
          Get Student Information
        </button>
      </div>
    </div>
  );
}
