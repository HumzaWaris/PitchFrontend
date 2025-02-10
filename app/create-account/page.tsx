'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function CreateAccount() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [fromSignup, setFromSignup] = useState(false);
    const [year, setYear] = useState("");
    const [collegeOf, setCollegeOf] = useState("");
    const [gradInterest, setGradInterest] = useState("");
    const [interests, setInterests] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedFlag = sessionStorage.getItem("fromSignup");
        if (!storedFlag) {
            router.push("/signup");
        } else {
            setFromSignup(true);
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                router.push("/signup");
            } else {
                setUser(user);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior"];
    const collegeOptions = ["Science", "Engineering", "Business", "Medicine", "Pharmacy", "Law", "Education", "Arts", "Media", "Agriculture", "Nursing", "Music"];
    const gradOptions = ["Yes", "No", "Maybe?"];
    const interestOptions = ["Reading", "Sports", "Video Games", "Socializing", "Projects", "Movies & TV"];

    const handleInterestChange = (interest) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else if (interests.length < 2) {
            setInterests([...interests, interest]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!year || !collegeOf || !gradInterest || interests.length === 0) {
            setError("Please answer all questions.");
            return;
        }

        if (!user) {
            setError("User not authenticated. Please sign in again.");
            return;
        }

        try {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                collegeOf: collegeOf,
                collegeYear: year,
                graduateSchool: gradInterest,
                userEnjoys: interests,
                savedFlyers: [],
                reportedFlyers: []
            }, { merge: true });

            sessionStorage.removeItem("fromSignup");
            router.push("/events");
        } catch (error) {
            setError("Error updating profile. Try again.");
        }
    };

    if (!fromSignup) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
            <h2 className="text-2xl font-bold mb-6">Tell us more about yourself.</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
                <div>
                    <p className="font-semibold mb-2">Year in College</p>
                    <div className="grid grid-cols-2 gap-2">
                        {yearOptions.map((y) => (
                            <button
                                type="button"
                                key={y}
                                className={`p-2 border rounded ${year === y ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => setYear(y)}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="font-semibold mb-2">College of</p>
                    <div className="grid grid-cols-3 gap-2">
                        {collegeOptions.map((college) => (
                            <button
                                type="button"
                                key={college}
                                className={`p-2 border rounded ${collegeOf === college ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => setCollegeOf(college)}
                            >
                                {college}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="font-semibold mb-2">Interested in Graduate School?</p>
                    <div className="grid grid-cols-3 gap-2">
                        {gradOptions.map((option) => (
                            <button
                                type="button"
                                key={option}
                                className={`p-2 border rounded ${gradInterest === option ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => setGradInterest(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="font-semibold mb-2">I enjoy... <span className="text-gray-400">Select up to 2</span></p>
                    <div className="grid grid-cols-3 gap-2">
                        {interestOptions.map((interest) => (
                            <button
                                type="button"
                                key={interest}
                                className={`p-2 border rounded ${interests.includes(interest) ? "bg-black text-white" : "bg-gray-200"}`}
                                onClick={() => handleInterestChange(interest)}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full p-3 text-white bg-purple-500 rounded-lg hover:bg-purple-600">
                    Next
                </button>
            </form>
        </div>
    );
}
