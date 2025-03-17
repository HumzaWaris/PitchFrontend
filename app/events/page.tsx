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
import { Button } from "../components/Banner";

/*
  Simple icons for tags.
  Adjust or expand as needed.
*/
function TagIcons({ tags = [] }) {
    const getIconForTag = (tag) => {
        switch (tag.toLowerCase()) {
            case "sports":
                return "⚽";
            case "music":
                return "🎵";
            case "art":
                return "🎨";
            default:
                return "🏷️";
        }
    };

    return (
        <div className="flex space-x-2 mt-2 text-lg">
            {tags.map((tag, index) => (
                <span key={index}>{getIconForTag(tag)}</span>
            ))}
        </div>
    );
}

/*
  BottomSheet component:
  - Fetches the club name from Firestore using event.clubID.
  - Shows event image, title, date/time, description, location map, tags, etc.
  - Provides an 'Add to Calendar' button linking to Google Calendar.
*/
function BottomSheet({ event, onClose }) {
    const [clubName, setClubName] = useState("");

    // Fetch club data once the event is selected
    useEffect(() => {
        const fetchClubData = async () => {
            if (event && event.clubID) {
                const clubRef = doc(db, "Clubs", event.clubID);
                const clubSnap = await getDoc(clubRef);
                if (clubSnap.exists()) {
                    // Adjust if your Clubs collection uses a different field name:
                    setClubName(clubSnap.data().clubName || "");
                }
            }
        };
        fetchClubData();
    }, [event]);

    if (!event) return null;

    // Build Google Calendar link (1-hour block, adjust as needed).
    const start = new Date(event.eventDate);
    // We'll assume 1 hour after start if there's no actual end time:
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    // Convert to YYYYMMDDTHHMMSSZ (UTC) format
    const formatForCalendar = (date) =>
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const startISO = formatForCalendar(start);
    const endISO = formatForCalendar(end);

    const calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.eventTitle || "Event"
    )}&dates=${startISO}%2F${endISO}&details=${encodeURIComponent(
        event.eventDescription || ""
    )}&location=${encodeURIComponent(event.eventLocation || "")}`;

    // We’ll only show the map if lat & long are non-zero.
    const hasMap = event.latitude !== 0 && event.longitude !== 0;
    const mapUrl = hasMap
        ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=es;z=14&output=embed`
        : null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 z-50">
            {/* Close button */}
            <div className="flex justify-end">
                <button
                    className="text-gray-500 hover:text-gray-700 font-semibold"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            {/* Content Scrollable if needed */}
            <div className="max-h-[70vh] overflow-y-auto px-2">
                {/* Image */}
                {event.flyer_image && (
                    <div className="w-full mb-4">
                        <Image
                            src={event.flyer_image}
                            alt={event.eventTitle}
                            width={400}
                            height={400}
                            className="mx-auto rounded-lg object-contain"
                        />
                    </div>
                )}

                {/* Title */}
                <h1 className="text-xl font-bold mb-2">
                    {event.eventTitle || "No Title"}
                </h1>

                {/* Tags right under the title */}
                {Array.isArray(event.tags) && event.tags.length > 0 && (
                    <div className="mb-2">
                        <TagIcons tags={event.tags} />
                    </div>
                )}

                {/* Organization (clubName) */}
                {clubName && (
                    <p className="text-gray-700 mb-2 font-semibold">
                        Hosted by: {clubName}
                    </p>
                )}

                {/* Location */}
                {event.eventLocation && (
                    <p className="text-gray-700 mb-2">
                        Location: <strong>{event.eventLocation}</strong>
                    </p>
                )}

                {/* Date & Time */}
                {event.eventDate && (
                    <p className="text-gray-700 mb-2">
                        {event.eventDate.toLocaleDateString()} @{" "}
                        {event.eventDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                )}

                {/* Description */}
                {event.eventDescription && (
                    <p className="text-gray-800 mb-2 leading-relaxed">
                        {event.eventDescription}
                    </p>
                )}

                {/* Small Map (only if lat/long != 0) */}
                {hasMap && (
                    <div className="mb-4">
                        <iframe
                            className="w-full rounded-lg"
                            height="200"
                            src={mapUrl}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Add to Calendar Button */}
                <div className="mt-4">
                    <a
                        href={calendarURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
                    >
                        Add to Calendar
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function Events() {
    // Default to Semester
    const [activeTab, setActiveTab] = useState("Semester");
    const [eventsData, setEventsData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const eventsQuery = query(
            collection(db, "Purdue University"),
            orderBy("eventDate", "asc")
        );
        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            const events = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();

                // Convert Firestore Timestamp or string date to JS Date
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

    const now = new Date();
    // Only upcoming
    const upcomingEvents = eventsData.filter(
        (event) => event.eventDate && event.eventDate >= now
    );

    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endOfSemester = new Date(2025, 4, 10);

    let displayedEvents =
        activeTab === "Weekly"
            ? upcomingEvents.filter((event) => event.eventDate <= oneWeekFromNow)
            : upcomingEvents.filter((event) => event.eventDate <= endOfSemester);

    // Group by weekday
    const eventsByDay = displayedEvents.reduce((acc, event) => {
        const day = event.eventDate.toLocaleDateString("en-US", {
            weekday: "long",
        });
        if (!acc[day]) acc[day] = [];
        acc[day].push(event);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-4">
            {/* Navbar */}
            <nav className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
                <div className="flex space-x-6">
                    <Link
                        href="/events"
                        className="font-semibold text-gray-700 flex items-center"
                    >
                        📅 Events
                    </Link>
                    <Link
                        href="/housing"
                        className="font-semibold text-gray-700 flex items-center"
                    >
                        🏠 Housing
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className="mt-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Events</h1>
                <div className="flex space-x-3">
                    <Button
                        variant={activeTab === "Weekly" ? "default" : "outline"}
                        onClick={() => setActiveTab("Weekly")}
                    >
                        Weekly
                    </Button>
                    <Button
                        variant={activeTab === "Semester" ? "default" : "outline"}
                        onClick={() => setActiveTab("Semester")}
                    >
                        Semester
                    </Button>
                    <Button variant="outline">⚙️ Filters</Button>
                </div>
            </header>

            {/* Events List */}
            <div className="mt-6 max-w-4xl mx-auto">
                {Object.entries(eventsByDay).map(([day, events]) => (
                    <div key={day} className="mt-6">
                        <h2 className="text-2xl font-bold mb-3">{day}</h2>
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        {event.flyer_image && (
                                            <Image
                                                src={event.flyer_image}
                                                width={60}
                                                height={60}
                                                className="rounded-lg object-cover"
                                                alt={event.eventTitle}
                                            />
                                        )}
                                        <div className="ml-4">
                                            <h3 className="text-lg font-bold">
                                                {event.eventTitle || "No Title"}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {event.eventDate.toLocaleDateString()} @{" "}
                                                {event.eventDate.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                {event.eventLocation || "No Address"}
                                            </p>
                                            {/* Use event.tags if your doc field is \"tags\". If it's \"eventTags\", revert. */}
                                            <TagIcons tags={event.tags || []} />
                                        </div>
                                    </div>

                                    {/* More Info button */}
                                    <div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            More Info
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Sheet */}
            <BottomSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
    );
}
