'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseConfig'; // Ensure you have Firebase initialized here
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUser({ id: currentUser.uid, ...userSnap.data() });
                    localStorage.setItem("displayName", userSnap.data().name || "User");
                } else {
                    await signOut(auth);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        setErrorMessage(''); // Clear previous errors
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                setErrorMessage('Unauthorized user. Contact admin.');
                await signOut(auth);
                return;
            }
            setUser({ id: user.uid, ...userSnap.data() });
            localStorage.setItem("displayName", userSnap.data().name || "User");

        } catch (error) {
            setErrorMessage('Wrong credentials. Please try again.');
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem("displayName");
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {user ? (
                <>
                    <p>Welcome, {user.name || 'User'}!</p>
                    <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
                    <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">Login</button>
                </div>
            )}
        </div>
    );
}
