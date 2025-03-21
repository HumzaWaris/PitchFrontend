"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function AccountInfoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const defaultCollege = searchParams.get("college") || "Purdue University";
    const defaultEmail = searchParams.get("email") || "";

    const [university, setUniversity] = useState(defaultCollege);
    const [email, setEmail] = useState(defaultEmail);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [passwordValid, setPasswordValid] = useState({
        length: false,
        specialChar: false,
        digit: false,
    });

    const validatePassword = (pwd) => {
        setPasswordValid({
            length: pwd.length >= 8,
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
            digit: /\d/.test(pwd),
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Basic checks
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        if (!passwordValid.length || !passwordValid.specialChar || !passwordValid.digit) {
            setError("Password does not meet the required criteria.");
            setLoading(false);
            return;
        }

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;

            await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                displayname: name,
                email,
                college: university,
                memberSince: `${new Date().getFullYear()}`
            });

            router.push("/signup/verify");
        } catch (err) {
            setError(err.message || "Error creating account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <div className="max-w-sm w-full bg-gray-50 p-6 rounded shadow">
                <button 
                    onClick={() => router.back()} 
                    className="text-black text-sm mb-4"
                >
                    &larr; Back
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">Account Information.</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        readOnly
                        className="w-full p-3 border rounded bg-gray-200"
                    />

                    <input
                        type="text"
                        placeholder="Student Name"
                        className="w-full p-3 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-3 border rounded"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                validatePassword(e.target.value);
                            }}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                    <div className="text-xs text-gray-600">
                        <p className={passwordValid.length ? "text-green-500" : "text-red-500"}>
                            ✓ 8 Characters
                        </p>
                        <p className={passwordValid.specialChar ? "text-green-500" : "text-red-500"}>
                            ✓ Special Character
                        </p>
                        <p className={passwordValid.digit ? "text-green-500" : "text-red-500"}>
                            ✓ Digit
                        </p>
                    </div>

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-3 border rounded"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full p-3 text-white bg-purple-500 rounded-lg hover:bg-purple-600"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Verify and Create Account"}
                    </button>
                </form>

                {loading && (
                    <div className="mt-4 p-3 text-center bg-red-100 text-red-500 rounded-lg">
                        <p>Retrieving User Info</p>
                        <p className="text-sm">Hang on a second. We are retrieving your information.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
