"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EnterEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [college] = useState(searchParams.get("college") || "Purdue University");
    const [email, setEmail] = useState("");


    const handleNext = () => {
        router.push(
            `/signup/create-account?college=${encodeURIComponent(college)}&email=${encodeURIComponent(email)}`
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
            <div className="max-w-sm w-full bg-gray-50 p-6 rounded shadow">
                <button 
                    onClick={() => router.back()} 
                    className="text-black text-sm mb-4"
                >
                    &larr; Select College
                </button>
                <h1 className="text-2xl font-bold text-center mb-6">
                    What&apos;s your email?
                </h1>
                <input
                    type="email"
                    placeholder="Enter your university email"
                    className="w-full p-3 mb-6 border border-gray-300 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    onClick={handleNext}
                    className="w-full py-2 rounded bg-purple-500 text-white font-semibold"
                >
                    Get Student Information
                </button>
            </div>
        </div>
    );
}
