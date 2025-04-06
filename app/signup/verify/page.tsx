"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email || "");
    }
    const checkVerification = setInterval(async () => {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      if (auth.currentUser?.emailVerified) {
        clearInterval(checkVerification);
        router.push("/signup/choices");
      }
    }, 5000);
    return () => clearInterval(checkVerification);
  }, [router]);

  const handleVerifiedClick = async () => {
    setError("");
    setResendMsg("");
    if (!auth.currentUser) {
      setError("No user found. Please sign up again.");
      return;
    }
    await auth.currentUser.reload();
    if (auth.currentUser?.emailVerified) {
      router.push("/signup/choices");
    } else {
      setError("Still not verified. Please wait a bit longer or resend the link.");
    }
  };

  const handleIncorrectEmail = () => {
    setError("");
    setResendMsg("");
    router.push("/signup/college");
  };

  const handleResend = async () => {
    setError("");
    setResendMsg("");
    if (!auth.currentUser) {
      setError("No user found. Please sign up again.");
      return;
    }
    try {
      await sendEmailVerification(auth.currentUser);
      setResendMsg("Verification email resent. Please check your inbox again.");
    } catch (err) {
      setError("Error resending verification. Try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-white">
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        <button
          onClick={() => router.back()}
          className="text-black text-sm mb-4"
        >
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-black">
          Verify Your Email.
        </h2>
        <p className="text-black text-sm mb-6">
          We have sent a verification link to:{" "}
          <span className="font-semibold">{userEmail}</span>
        </p>
        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}
        {resendMsg && (
          <p className="text-green-600 text-sm mb-4">
            {resendMsg}
          </p>
        )}
        <div className="space-y-3">
          <button
            onClick={handleVerifiedClick}
            className="w-full py-3 rounded-md bg-purple-500 text-white font-semibold hover:bg-purple-600"
          >
            Verified my Email
          </button>
          <button
            onClick={handleIncorrectEmail}
            className="w-full py-3 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Incorrect Email
          </button>
        </div>
        <button
          onClick={handleResend}
          className="mt-6 text-sm text-purple-700 font-semibold hover:underline"
        >
          Didn&apos;t receive the email? Resend
        </button>
        <p className="text-gray-500 text-sm mt-4">
          Waiting for confirmation...
        </p>
      </div>
    </div>
  );
}
