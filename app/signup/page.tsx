'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [university, setUniversity] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValid, setPasswordValid] = useState({ length: false, specialChar: false, digit: false });
    const [isTyping, setIsTyping] = useState(false);

    const router = useRouter();

    const universityEmailSuffix = {
        "": "@university.edu",
        "Purdue University": "@purdue.edu",
        "Indiana University": "@iu.edu",
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setIsTyping(e.target.value.length > 0);
    };

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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                displayname: name,
                email,
                college: university,
                memberSince: `${new Date().getFullYear()}'`
            });

            router.push("/verify");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <div className="p-6 bg-white shadow-xl rounded-2xl w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Account Information</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <select
                        className="w-full p-2 mb-4 border rounded"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required
                    >
                        <option value="">Select University</option>
                        <option value="Purdue University">Purdue University</option>
                        <option value="Indiana University">Indiana University</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Student Name"
                        className="w-full p-2 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-2 border rounded"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        {!isTyping && university && email === "" && (
                            <span className="absolute right-3 top-3 text-gray-400">
                                {universityEmailSuffix[university]}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-2 border rounded"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                validatePassword(e.target.value);
                            }}
                            required
                        />
                        <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                    <div className="text-xs text-gray-600">
                        <p className={passwordValid.length ? "text-green-500" : "text-red-500"}>✓ 8 Characters</p>
                        <p className={passwordValid.specialChar ? "text-green-500" : "text-red-500"}>✓ Special Character</p>
                        <p className={passwordValid.digit ? "text-green-500" : "text-red-500"}>✓ Digit</p>
                    </div>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-2 border rounded"
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
