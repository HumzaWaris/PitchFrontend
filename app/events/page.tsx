"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    doc,
    getDoc,
} from "firebase/firestore";

import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import GroupsIcon from "@mui/icons-material/Groups";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SchoolIcon from "@mui/icons-material/School";
import BuildIcon from "@mui/icons-material/Build";
import CelebrationIcon from "@mui/icons-material/Celebration";
import PublicIcon from "@mui/icons-material/Public";
import FastfoodIcon from "@mui/icons-material/Fastfood";


function TagIcons({ tags = [] }) {
    const getIconForTag = (tagName) => {
        switch (tagName.toLowerCase()) {
            case "games":
                return <SportsEsportsIcon style={{ color: "black" }} />;
            case "sports":
                return <SportsSoccerIcon style={{ color: "black" }} />;
            case "clubs":
                return <GroupsIcon style={{ color: "black" }} />;
            case "music":
                return <MusicNoteIcon style={{ color: "black" }} />;
            case "education":
                return <SchoolIcon style={{ color: "black" }} />;
            case "project":
                return <BuildIcon style={{ color: "black" }} />;
            case "party":
                return <CelebrationIcon style={{ color: "black" }} />;
            case "culture":
                return <PublicIcon style={{ color: "black" }} />;
            case "free food":
                return <FastfoodIcon style={{ color: "black" }} />;
            default:
                return <BuildIcon style={{ color: "black" }} />;
        }
    };

    return (
        <div className="flex space-x-2 mt-2">
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white"
                >
                    {getIconForTag(tag)}
                </span>
            ))}
        </div>
    );
}

function FilterModal({ onClose, selectedTags, setSelectedTags }) {
    const allFilters = [
        { label: "Party", value: "party", icon: <CelebrationIcon style={{ color: "black" }} /> },
        { label: "Sports", value: "sports", icon: <SportsSoccerIcon style={{ color: "black" }} /> },
        { label: "Games", value: "games", icon: <SportsEsportsIcon style={{ color: "black" }} /> },
        { label: "Clubs", value: "clubs", icon: <GroupsIcon style={{ color: "black" }} /> },
        { label: "Culture", value: "culture", icon: <PublicIcon style={{ color: "black" }} /> },
        { label: "Project", value: "project", icon: <BuildIcon style={{ color: "black" }} /> },
        { label: "Education", value: "education", icon: <SchoolIcon style={{ color: "black" }} /> },
        { label: "Food", value: "food", icon: <FastfoodIcon style={{ color: "black" }} /> },
        { label: "Free Entry", value: "free entry", icon: <BuildIcon style={{ color: "black" }} /> },
        { label: "Free Food", value: "free food", icon: <FastfoodIcon style={{ color: "black" }} /> },
    ];

    const handleToggle = (value) => {
        if (selectedTags.includes(value)) {
            setSelectedTags(selectedTags.filter((t) => t !== value));
        } else {
            setSelectedTags([...selectedTags, value]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
            
            <div className="relative w-11/12 max-w-lg bg-white rounded-lg shadow-lg p-6 z-50">
                <button
                    className="absolute top-2 right-2 text-2xl text-black font-bold"
                    onClick={onClose}
                >
                    &times;
                </button>
                
                <h2 className="text-black text-2xl font-bold text-center mb-6">Choose Event Types</h2>

                <div className="flex flex-col space-y-3">
                    {allFilters.map((filter) => {
                        const isSelected = selectedTags.includes(filter.value);
                        return (
                            <button
                                key={filter.value}
                                onClick={() => handleToggle(filter.value)}
                                className={`w-full py-3 px-4 rounded-full flex items-center justify-start space-x-3 border ${
                                    isSelected
                                        ? "bg-gray-200"
                                        : "bg-white hover:bg-gray-100"
                                }`}
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    {filter.icon}
                                </div>
                                <span className="text-black">{filter.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-black text-white rounded-full font-bold"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalPopUp({ event, onClose }) {
    const [clubName, setClubName] = useState("");

    useEffect(() => {
        const fetchClubData = async () => {
            if (event && event.clubID) {
                const clubRef = doc(db, "Clubs", event.clubID);
                const clubSnap = await getDoc(clubRef);
                if (clubSnap.exists()) {
                    setClubName(clubSnap.data().clubName || "");
                }
            }
        };
        fetchClubData();
    }, [event]);

    if (!event) return null;

    const start = new Date(event.eventDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatForCalendar = (date) =>
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const startISO = formatForCalendar(start);
    const endISO = formatForCalendar(end);

    const calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.eventTitle || "Event"
    )}&dates=${startISO}%2F${endISO}&details=${encodeURIComponent(
        event.eventDescription || ""
    )}&location=${encodeURIComponent(event.eventLocation || "")}`;

    const hasMap =
        event.latitude && event.longitude && (event.latitude !== 0 || event.longitude !== 0);
    const mapUrl = hasMap
        ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=es;z=14&output=embed`
        : null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            <div className="relative bg-white w-11/12 max-w-2xl rounded-lg shadow-lg z-50 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-end p-3">
                    <button
                        className="text-black font-bold text-2xl"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <div className="px-6 pb-6">
                    {event.flyer_image && (
                        <div className="w-full mb-4 flex justify-center">
                            <Image
                                src={event.flyer_image}
                                alt={event.eventTitle}
                                width={300}
                                height={200}
                                className="rounded-md object-contain"
                            />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-black mb-2">
                        {event.eventTitle || "No Title"}
                    </h1>
                    {Array.isArray(event.tags) && event.tags.length > 0 && (
                        <TagIcons tags={event.tags} />
                    )}
                    {clubName && (
                        <p className="mt-2 text-gray-800">
                            <span className="font-semibold">Hosted by: </span>
                            {clubName}
                        </p>
                    )}
                    {event.eventLocation && (
                        <p className="text-gray-800 mt-2">
                            <span className="font-semibold">Location: </span>
                            {event.eventLocation}
                        </p>
                    )}
                    <p className="text-gray-800 mt-1">
                        {start.toLocaleDateString()} @{" "}
                        {start.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                    {event.eventDescription && (
                        <p className="text-gray-600 mt-2">
                            {event.eventDescription}
                        </p>
                    )}
                    {mapUrl && (
                        <div className="mt-4">
                            <iframe
                                className="w-full h-48 md:h-56 rounded-md"
                                src={mapUrl}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    )}
                    <div className="mt-4">
                        <a
                            href={calendarURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800"
                        >
                            Add to Calendar
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Events() {
    const [activeTab, setActiveTab] = useState("Semester");
    const [eventsData, setEventsData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // For filters
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    // We'll read the user's displayName from localStorage:
    const [displayName, setDisplayName] = useState("User");

    useEffect(() => {
        const nameFromStorage = localStorage.getItem("displayName");
        if (nameFromStorage) {
            setDisplayName(nameFromStorage);
        }
    }, []);

    // Firestore subscription for events
    useEffect(() => {
        const eventsQuery = query(
            collection(db, "Purdue University"),
            orderBy("eventDate", "asc")
        );
        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            const events = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                let formattedDate;
                if (data.eventDate?.toDate) {
                    formattedDate = data.eventDate.toDate();
                } else {
                    formattedDate = new Date(data.eventDate);
                }
                return { id: docSnap.id, ...data, eventDate: formattedDate };
            });
            setEventsData(events);
        });
        return () => unsubscribe();
    }, []);

    // Filter for only upcoming events
    const now = new Date();
    const upcomingEvents = eventsData.filter(
        (event) => event.eventDate && event.eventDate >= now
    );

    // If "Weekly", only show events in next 7 days
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // If "Semester", up to May 10, 2025
    const endOfSemester = new Date(2025, 4, 10);

    // Step 1: Filter by time (Weekly/Semester)
    let displayedEvents =
        activeTab === "Weekly"
            ? upcomingEvents.filter((evt) => evt.eventDate <= oneWeekFromNow)
            : upcomingEvents.filter((evt) => evt.eventDate <= endOfSemester);

    // Step 2: If we have selected tags, show events that match *ANY* of those tags
    if (selectedTags.length > 0) {
        displayedEvents = displayedEvents.filter((event) => {
            if (!Array.isArray(event.tags)) return false;
            // Convert each tag to lower-case
            const eventTagsLC = event.tags.map((t) => t.toLowerCase());
            // We want to see if there's an overlap with selectedTags
            return selectedTags.some((sel) => eventTagsLC.includes(sel));
        });
    }

    // Group final list by weekday
    const eventsByDay = displayedEvents.reduce((acc, event) => {
        const day = event.eventDate.toLocaleDateString("en-US", {
            weekday: "long",
        });
        if (!acc[day]) acc[day] = [];
        acc[day].push(event);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-white">
            <nav className="flex items-center justify-between px-6 py-4 bg-white">
                <div className="flex items-center space-x-5">
                    <Image
                        src="/images/penguin.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/events"
                            className="text-black font-semibold flex items-center"
                        >
                            <span className="mr-1">📅</span>
                            Events
                        </Link>
                        <Link
                            href="/housing"
                            className="text-black font-semibold flex items-center"
                        >
                            <span className="mr-1">🏠</span>
                            Housing
                        </Link>
                    </div>
                </div>

                <button
                    onClick={() => {}}
                    className="px-4 py-2 rounded-full bg-gray-200 text-black font-semibold"
                >
                    {displayName}
                </button>
            </nav>

            <header className="flex items-center justify-between px-6 mt-4">
                <div className="flex items-center space-x-6">
                    <h1 className="text-4xl font-extrabold text-black">Events</h1>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setActiveTab("Weekly")}
                            className={`px-4 py-1 rounded-full font-bold ${
                                activeTab === "Weekly"
                                    ? "bg-gray-300 text-black"
                                    : "bg-white border border-black text-black"
                            }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setActiveTab("Semester")}
                            className={`px-4 py-1 rounded-full font-bold ${
                                activeTab === "Semester"
                                    ? "bg-gray-300 text-black"
                                    : "bg-white border border-black text-black"
                            }`}
                        >
                            Semester
                        </button>
                    </div>
                </div>
                
                <button
                    onClick={() => setShowFilterModal(true)}
                    className="px-4 py-1 rounded-full bg-gray-300 text-black font-bold flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 4a1 1 0 011-1h16a1 
                            1 0 011 1v2a1 1 0 01-.293.707l-5.414 
                            5.414A1 1 0 0014 12.414V19l-4 
                            2v-8.586a1 1 0 00-.293-.707L4.293 
                            6.707A1 1 0 014 6V4z"
                        />
                    </svg>
                    All Filters
                </button>
            </header>

            <div className="px-6 py-6">
                {Object.entries(eventsByDay).map(([day, events]) => (
                    <div key={day} className="mb-8">
                        <h2 className="text-3xl font-bold text-black mb-2">
                            {day}
                        </h2>
                        <div className="border-b border-dotted border-gray-300 mb-4"></div>
                        <div className="space-y-6">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center space-x-4 cursor-pointer hover:shadow-md transition"
                                >
                                    {event.flyer_image && (
                                        <Image
                                            src={event.flyer_image}
                                            width={80}
                                            height={80}
                                            className="rounded-lg object-cover"
                                            alt={event.eventTitle}
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-black mb-1">
                                            {event.eventTitle || "No Title"}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {event.eventDate.toLocaleDateString()} @{" "}
                                            {event.eventDate.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {event.eventLocation || "No Address"}
                                        </p>
                                        <TagIcons tags={event.tags || []} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <ModalPopUp event={selectedEvent} onClose={() => setSelectedEvent(null)} />

            {showFilterModal && (
                <FilterModal
                    onClose={() => setShowFilterModal(false)}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                />
            )}
        </div>
    );
}
