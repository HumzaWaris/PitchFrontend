"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function CreateAccount() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [year, setYear] = useState("");
  const [collegeOf, setCollegeOf] = useState("");
  const [gradInterest, setGradInterest] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");

  const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior"];
  const collegeOptions = [
    "Science",
    "Engineering",
    "Business",
    "Medicine",
    "Pharmacy",
    "Law",
    "Education",
    "Arts",
    "Media",
    "Agriculture",
    "Nursing",
    "Music",
  ];
  const gradOptions = ["Yes", "No", "Maybe?"];
  const interestOptions = [
    "Reading",
    "Sports",
    "Video Games",
    "Socializing",
    "Projects",
    "Movies & TV",
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/signup/college");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleInterestChange = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 2) {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!year || !collegeOf || !gradInterest || interests.length === 0) {
      setError("Please fill out all sections.");
      return;
    }
    if (!user) {
      setError("No user found. Please sign in again.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          collegeOf,
          collegeYear: year,
          graduateSchool: gradInterest,
          userEnjoys: interests,
          savedFlyers: [],
          reportedFlyers: [],
        },
        { merge: true }
      );
      router.push("/events");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error updating profile. Please try again.");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <button
        onClick={() => router.back()}
        className="self-start mb-4 text-sm text-black"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        Tell us more <br /> about yourself.
      </h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md text-black">
        <div>
          <p className="font-semibold mb-2">Year in College</p>
          <div className="grid grid-cols-2 gap-1">
            {yearOptions.map((y) => (
              <button
                type="button"
                key={y}
                className={`p-2 border border-black rounded-md text-center ${
                  year === y ? "bg-black text-white" : "bg-white"
                }`}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2">College of</p>
          <div className="grid grid-cols-3 gap-1">
            {collegeOptions.map((co) => (
              <button
                type="button"
                key={co}
                className={`p-2 border border-black rounded-md text-center ${
                  collegeOf === co ? "bg-black text-white" : "bg-white"
                }`}
                onClick={() => setCollegeOf(co)}
              >
                {co}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2">Interested in Graduate School?</p>
          <div className="grid grid-cols-3 gap-1">
            {gradOptions.map((g) => (
              <button
                type="button"
                key={g}
                className={`p-2 border border-black rounded-md text-center ${
                  gradInterest === g ? "bg-black text-white" : "bg-white"
                }`}
                onClick={() => setGradInterest(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2">
            I enjoy... <span className="text-gray-400">Select up to 2</span>
          </p>
          <div className="grid grid-cols-3 gap-1">
            {interestOptions.map((interest) => (
              <button
                type="button"
                key={interest}
                className={`p-2 border border-black rounded-md text-center ${
                  interests.includes(interest) ? "bg-black text-white" : "bg-white"
                }`}
                onClick={() => handleInterestChange(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600"
        >
          Next
        </button>
      </form>
    </div>
  );
}
