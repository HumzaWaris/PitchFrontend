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
            <div className="max-w-sm w-full bg-gray-50 p-6 rounded shadow">
                <button 
                    onClick={() => router.back()} 
                    className="text-black text-sm mb-4"
                >
                    &larr; Select College
                </button>
                <h1 className="text-2xl font-bold text-center mb-4">
                    Select Your College.
                </h1>
                <select
                    className="w-full border border-gray-300 rounded p-2 mb-6"
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                >
                    <option value="Purdue University">Purdue University</option>
                    <option value="Indiana University">Indiana University</option>
                </select>
                <button
                    onClick={handleNext}
                    className="w-full py-2 rounded bg-purple-500 text-white font-semibold"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
