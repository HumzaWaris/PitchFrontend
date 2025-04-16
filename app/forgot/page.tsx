"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError("Error sending password reset email. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <button onClick={() => router.back()} className="absolute top-4 left-4 text-black text-sm">
        &larr; Back
      </button>
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Reset Password</h1>
        {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block text-black text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          onClick={handlePasswordReset}
          disabled={loading || !email.trim()}
          className="w-full p-3 bg-purple-500 text-white rounded-md font-semibold hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Password Reset Email"}
        </button>
      </div>
    </div>
  );
}
