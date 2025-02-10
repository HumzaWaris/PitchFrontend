'use client';

import { useState } from "react";
import { collection, addDoc, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig"; // Ensure correct path

export default function ScheduleRater() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const ensureCollectionExists = async () => {
        const querySnapshot = await getDocs(collection(db, "Purdue University - Schedules"));
        if (querySnapshot.empty) {
            await setDoc(doc(db, "Purdue University - Schedules", "metadata"), {
                createdAt: serverTimestamp(),
                description: "This collection stores Purdue University schedule PDFs."
            });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a PDF file to upload.");
            return;
        }

        setUploading(true);
        setMessage("");

        try {
            await ensureCollectionExists();
            const storageRef = ref(storage, `Purdue University - Schedules/${file.name}`);
            await uploadBytes(storageRef, file);
            const fileURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "Purdue University - Schedules"), {
                fileName: file.name,
                fileURL: fileURL,
                uploadedAt: serverTimestamp(),
            });

            setMessage("File uploaded successfully!");

            // Reset file input field
            setFile(null);
            document.getElementById("fileInput").value = "";
        } catch (error) {
            setMessage("Error uploading file. Please try again.");
            console.error("Upload Error:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Schedule</h2>
                <p className="text-gray-600 text-sm text-center mb-4">
                    Upload a PDF of your schedule to get it rated based on efficiency, difficulty, and gaps.
                </p>
                <input
                    id="fileInput"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="mb-4 w-full border p-2 rounded"
                />
                <button
                    onClick={handleUpload}
                    className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Upload PDF"}
                </button>
                {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
            </div>
        </div>
    );
}
