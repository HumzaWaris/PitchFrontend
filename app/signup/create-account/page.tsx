"use client";

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function CreateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const university = searchParams.get("college") || "Purdue University";
  const email = searchParams.get("email") || "";
  const defaultName = searchParams.get("name") || "";

  const [name, setName] = useState(defaultName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    specialChar: false,
    digit: false,
  });

  const validatePassword = (pwd: string) => {
    setPasswordValid({
      length: pwd.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      digit: /\d/.test(pwd),
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
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
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await sendEmailVerification(user);

      await setDoc(
        doc(db, "users", user.uid),
        {
          displayname: name,
          email,
          college: university,
          memberSince: `${new Date().getFullYear()}`,
        },
        { merge: true }
      );

      router.push("/signup/verify");
    } catch (err: any) {
      setError(err.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        <button onClick={() => router.back()} className="text-black text-sm mb-4">
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-black">
          Account Information
        </h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            value={university}
            readOnly
            className="w-full p-3 border rounded bg-gray-200 text-black"
          />
          <input
            type="text"
            placeholder="Student Name"
            className="w-full p-3 border rounded text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={!!defaultName}        // locked if we found it
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded text-black"
            value={email}
            readOnly                                      // always locked
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded text-black"
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
              {showPassword ? (
                <EyeOffIcon size={18} style={{ color: "black" }} />
              ) : (
                <EyeIcon size={18} style={{ color: "black" }} />
              )}
            </button>
          </div>

          {/* Password criteria */}
          <div className="text-xs text-black font-bold">
            <p className={passwordValid.length ? "text-green-500" : "text-red-500"}>✓ 8 Characters</p>
            <p className={passwordValid.specialChar ? "text-green-500" : "text-red-500"}>✓ Special Character</p>
            <p className={passwordValid.digit ? "text-green-500" : "text-red-500"}>✓ Digit</p>
          </div>

          {/* Confirm */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-3 border rounded text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={18} style={{ color: "black" }} />
              ) : (
                <EyeIcon size={18} style={{ color: "black" }} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full p-3 text-white bg-purple-500 rounded-md hover:bg-purple-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating Account…" : "Verify and Create Account"}
          </button>
        </form>

        {loading && (
          <div className="mt-4 p-3 text-center bg-red-100 text-red-500 rounded-md">
            <p>Creating Account</p>
            <p className="text-sm">Hang on a second. We are saving your information.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CreateAccountForm />
    </Suspense>
  );
}
