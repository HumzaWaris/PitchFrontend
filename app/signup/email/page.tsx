"use client";

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, Suspense } from "react";

const MAX_ATTEMPTS = 3;

function EmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [college] = useState(searchParams.get("college") || "Purdue University");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const attempts = useRef(0);

  const lookupDirectory = async () => {
    const res = await fetch(`/api/purdue?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error("Directory lookup failed");
    return res.json() as Promise<{ found: boolean; name?: string }>;
  };

  const handleNext = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    // Purdue email → try to auto‑fill name
    if (email.endsWith("@purdue.edu") && college.toLowerCase().includes("purdue")) {
      setLoading(true);
      try {
        const { found, name } = await lookupDirectory();
        if (found && name) {
          router.push(
            `/signup/create-account?college=${encodeURIComponent(college)}` +
              `&email=${encodeURIComponent(email)}` +
              `&name=${encodeURIComponent(name)}`
          );
          return;
        }

        attempts.current += 1;
        if (attempts.current >= MAX_ATTEMPTS) {
          const bypass = window.confirm(
            "We can't find you in the Purdue directory. Continue anyway?"
          );
          if (bypass) {
            router.push(
              `/signup/create-account?college=${encodeURIComponent(college)}` +
                `&email=${encodeURIComponent(email)}`
            );
            return;
          }
        }

        setError("Student not found – please try again with a valid Purdue email.");
      } catch {
        setError("Network error while contacting the Purdue directory.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Non‑Purdue email – just continue
    router.push(
      `/signup/create-account?college=${encodeURIComponent(college)}` +
        `&email=${encodeURIComponent(email)}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        <button onClick={() => router.back()} className="text-black text-sm mb-4">
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          What's your email?
        </h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Enter your university email"
          className="w-full p-3 mb-6 border border-gray-300 rounded-md bg-gray-100 text-black focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full py-3 rounded-md bg-purple-500 text-white font-semibold hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Retrieving User Info…" : "Get Student Information"}
        </button>
      </div>
    </div>
  );
}

export default function EnterEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EmailForm />
    </Suspense>
  );
}

