'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';

export default function LoginPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                // Not strictly necessary, but you could set a placeholder user
                setUser({ email: currentUser.email });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        setErrorMessage('');
        try {
            console.log('[handleLogin] Attempting signInWithEmailAndPassword with:', email, password);
            await signInWithEmailAndPassword(auth, email, password);

            // Now we query the "users" collection for a doc that has the same email
            console.log('[handleLogin] Signed in successfully. Now querying Firestore...');
            const usersRef = collection(db, 'users'); // ensure this matches your actual collection name
            const q = query(usersRef, where('email', '==', email));
            const snapshot = await getDocs(q);

            console.log('[handleLogin] Firestore query snapshot:', snapshot);

            if (snapshot.empty) {
                console.warn('[handleLogin] No user doc found for this email:', email);
                setErrorMessage('No user doc found in Firestore for that email.');
                await signOut(auth);
                return;
            }

            // We'll use the first matching doc
            const docSnap = snapshot.docs[0];
            const userData = docSnap.data();
            console.log('[handleLogin] Found doc data:', userData);

            // If userData doesn't have displayName, we fallback to "User"
            const rawDisplayName = userData.displayName || 'User';
            const firstName = rawDisplayName.split(' ')[0];
            console.log('[handleLogin] Resolved firstName:', firstName);

            setUser({ email, displayName: firstName });
            localStorage.setItem('displayName', firstName);
            sessionStorage.setItem('userSession', firstName);

        } catch (error) {
            console.error('[handleLogin] Error:', error);
            setErrorMessage('Wrong credentials. Please try again.');
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('displayName');
        sessionStorage.removeItem('userSession');
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center justify-center h-screen relative">
            {user && (
                <button
                    onClick={() => router.push('/')}
                    className="absolute top-4 right-4 px-4 py-2 bg-white/70 text-black rounded shadow"
                >
                    Go Home
                </button>
            )}

            {user ? (
                <>
                    <p className="text-xl mb-4">
                        Welcome to {user.displayName || 'User'}!
                    </p>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    {errorMessage && (
                        <p className="text-red-500">{errorMessage}</p>
                    )}
                    <input
                        type="email"
                        placeholder="Enter your .edu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-4 py-2 border rounded"
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-2 border rounded"
                    />
                    <button
                        onClick={handleLogin}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Login
                    </button>
                </div>
            )}
        </div>
    );
}
