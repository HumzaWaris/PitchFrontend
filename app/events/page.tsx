"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Button } from "../components/Banner";

export default function Events() {
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [eventsData, setEventsData] = useState([]);
    const [expandedEvent, setExpandedEvent] = useState(null);

    useEffect(() => {
        const eventsQuery = query(collection(db, "Purdue University"), orderBy("eventDate", "asc"));

        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                let formattedDate = null;

                if (data.eventDate?.toDate) {
                    formattedDate = data.eventDate.toDate();
                } else if (typeof data.eventDate === "string") {
                    formattedDate = new Date(data.eventDate);
                }

                return { id: doc.id, ...data, eventDate: formattedDate };
            });

            console.log("Fetched events:", events);
            setEventsData(events);
        });

        return () => unsubscribe();
    }, []);

    // Add event to Google Calendar
    const addToGoogleCalendar = (event) => {
        if (!event.eventTitle || !event.eventDate) {
            alert("Event details are missing.");
            return;
        }

        const startDate = event.eventDate.toISOString().replace(/-|:|\.\d+/g, "");
        const endDate = new Date(event.eventDate.getTime() + 60 * 60 * 1000)
            .toISOString()
            .replace(/-|:|\.\d+/g, "");

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.eventDescription || "")}&location=${encodeURIComponent(event.eventLocation || "")}&sf=true&output=xml`;

        window.open(googleCalendarUrl, "_blank");
    };

    // Toggle event details
    const toggleEventDetails = (eventId) => {
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };

    // Split events into upcoming and past
    const now = new Date();
    const upcomingEvents = eventsData.filter(event => event.eventDate && event.eventDate >= now);
    const pastEvents = eventsData
        .filter(event => event.eventDate && event.eventDate < now)
        .sort((a, b) => b.eventDate - a.eventDate);

    const displayedEvents = activeTab === "Upcoming" ? upcomingEvents : pastEvents;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-b from-gray-200 to-white p-6 shadow-sm flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                <div className="space-x-2">
                    <Button
                        variant={activeTab === "Upcoming" ? "default" : "outline"}
                        onClick={() => setActiveTab("Upcoming")}
                    >
                        Upcoming
                    </Button>
                    <Button
                        variant={activeTab === "Past" ? "default" : "outline"}
                        onClick={() => setActiveTab("Past")}
                    >
                        Past
                    </Button>
                </div>
            </header>

            {/* Events List */}
            <div className="p-6 max-w-4xl mx-auto">
                {displayedEvents.length === 0 ? (
                    <p className="text-gray-500 text-center">No events available.</p>
                ) : (
                    displayedEvents.map((event, index) => (
                        <div key={index} className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700">
                                {event.eventDate ? event.eventDate.toDateString() : "No Date"}
                            </h2>
                            <div className="border-l-2 border-gray-300 pl-4 mt-4">
                                <div className="bg-white p-4 rounded-lg shadow-md flex items-center mb-4">
                                    <div className="flex-1">
                                        <p className="text-gray-600 text-sm">
                                            {event.eventDate ? event.eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "No Time"}
                                        </p>

                                        <h3 className="text-lg font-bold text-gray-800">{event.eventTitle || "No Title"}</h3>

                                        {/* Clickable Google Maps Location */}
                                        <p className="text-yellow-500 text-sm">
                                            📍 <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.eventLocation)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-600 hover:text-blue-800"
                                        >
                                            {event.eventLocation || "No Location"}
                                        </a>
                                        </p>

                                        <p className="text-gray-500 text-sm">📜 {event.eventDescription || "No Description"}</p>
                                        <div className="mt-2 flex space-x-2">
                                            {/* Add to Google Calendar Button */}
                                            <Button
                                                className="bg-blue-500 text-white"
                                                onClick={() => addToGoogleCalendar(event)}
                                            >
                                                📅 Add to Calendar
                                            </Button>

                                            {/* More Info Button */}
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleEventDetails(event.id)}
                                            >
                                                {expandedEvent === event.id ? "▲ Less Info" : "▼ More Info"}
                                            </Button>
                                        </div>

                                        {/* Expanded Event Details */}
                                        {expandedEvent === event.id && (
                                            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-inner">
                                                <p className="text-sm text-gray-700"><strong>Organizer:</strong> {event.eventOrganizer || "Not specified"}</p>
                                                <p className="text-sm text-gray-700"><strong>Category:</strong> {event.eventCategory || "Not specified"}</p>
                                                <p className="text-sm text-gray-700"><strong>Details:</strong> {event.eventDescription || "No additional details available."}</p>
                                            </div>
                                        )}
                                    </div>
                                    {event.flyer_image && (
                                        <Image src={event.flyer_image} width={80} height={80} className="rounded-lg" alt={event.eventTitle} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
