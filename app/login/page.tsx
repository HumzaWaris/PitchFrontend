"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Just track whether we are done checking the currentUser
  const [checking, setChecking] = useState(true);

  // Email/pass
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // For error messages
  const [errorMessage, setErrorMessage] = useState("");

  // We'll only skip the login form if user is truly logged in AND we have localStorage set
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // If the user is already logged in, we can do a quick check to see if localStorage is set
        // But the simpler approach is: do nothing, let the user see the login page, or sign out.
        // They can also navigate away. For clarity, we'll just stop loading.
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Now fetch the user doc from Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorMessage("No user doc found in Firestore for that email.");
        await signOut(auth);
        return;
      }

      // We'll take the first doc
      const docSnap = snapshot.docs[0];
      const userData = docSnap.data();

      // We expect userData.displayName to exist
      const rawDisplayName = userData.displayName || "User";
      const firstName = rawDisplayName.split(" ")[0] || "User";

      localStorage.setItem("displayName", firstName);

      router.push("/events");
    } catch (err) {
      console.error("[handleLogin] Error:", err);
      setErrorMessage("Wrong credentials. Please try again.");
    }
  };

  if (checking) {
    return <p className="text-center mt-10 text-black">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-black text-sm"
      >
        &larr; Back
      </button>
      <div className="max-w-sm w-full bg-gray-50 p-6 rounded-md shadow">
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          Login.
        </h1>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {errorMessage}
          </p>
        )}
        <div className="mb-4">
          <label className="block text-black text-sm font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-2 relative">
          <label className="block text-black text-sm font-semibold mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 bottom-3 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon size={18} style={{ color: "black" }} />
            ) : (
              <EyeIcon size={18} style={{ color: "black" }} />
            )}
          </button>
        </div>
        <div className="mb-6 text-right">
          <button
            onClick={() => alert("Forgot Password flow not implemented yet.")}
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="w-full p-3 bg-purple-500 text-white rounded-md font-semibold hover:bg-purple-600"
        >
          Login
        </button>
      </div>
    </div>
  );
}
