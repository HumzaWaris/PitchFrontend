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
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push("/events");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorMessage("No user doc found in Firestore for that email.");
        await signOut(auth);
        return;
      }

      const docSnap = snapshot.docs[0];
      const userData = docSnap.data();
      // Use "displayName" (capital N) as stored in Firestore
      const rawDisplayName = userData.displayName || "User";
      const firstName = rawDisplayName.split(" ")[0] || "User";
      localStorage.setItem("displayName", firstName);

      router.push("/events");
    } catch (error) {
      console.error("[handleLogin] Error:", error);
      setErrorMessage("Wrong credentials. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-10 text-black">Loading...</p>;

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
          <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
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
            {showPassword ? <EyeOffIcon size={18} style={{ color: "black" }} /> : <EyeIcon size={18} style={{ color: "black" }} />}
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
