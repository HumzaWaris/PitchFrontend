"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";

export default function VerifyEmail() {
    const router = useRouter();

    useEffect(() => {
        const checkVerification = setInterval(async () => {
            await auth.currentUser.reload();
            if (auth.currentUser?.emailVerified) {
                clearInterval(checkVerification);
                router.push("/create-account"); // Redirect to create account page
            }
        }, 5000);

        return () => clearInterval(checkVerification);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
            <p className="text-gray-600 mb-4">Check your inbox and verify your account.</p>
            <p className="text-blue-500 text-sm">Waiting for confirmation...</p>
        </div>
    );
}
