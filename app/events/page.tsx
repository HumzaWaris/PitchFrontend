"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const getIconForTag = (tagName: string) => {
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

  const handleToggle = (value: string) => {
    if (selectedTags.includes(value)) {
      setSelectedTags(selectedTags.filter((t) => t !== value));
    } else {
      setSelectedTags([...selectedTags, value]);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
        {/* Modal content */}
        <div className="relative w-11/12 max-w-md bg-white rounded-md shadow-lg p-4 z-50">
          <button
              className="absolute top-2 right-2 text-2xl text-black font-bold"
              onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-black text-2xl font-bold text-center mb-4">
            Choose Event Types
          </h2>
          <div className="flex flex-col space-y-2">
            {allFilters.map((filter) => {
              const isSelected = selectedTags.includes(filter.value);
              return (
                  <button
                      key={filter.value}
                      onClick={() => handleToggle(filter.value)}
                      className={`w-full py-2 px-3 rounded-md flex items-center justify-start space-x-2 border ${
                          isSelected ? "bg-gray-200" : "bg-white hover:bg-gray-100"
                      }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {filter.icon}
                    </div>
                    <span className="text-black font-bold">{filter.label}</span>
                  </button>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-black text-white rounded-md font-bold"
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
  const formatForCalendar = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const startISO = formatForCalendar(start);
  const endISO = formatForCalendar(end);
  const calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.eventTitle || "Event"
  )}&dates=${startISO}%2F${endISO}&details=${encodeURIComponent(
      event.eventDescription || ""
  )}&location=${encodeURIComponent(event.eventLocation || "")}`;

  const hasMap =
      event.latitude &&
      event.longitude &&
      (event.latitude !== 0 || event.longitude !== 0);
  const mapUrl = hasMap
      ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=es;z=14&output=embed`
      : null;

  return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
        {/* Popup container */}
        <div className="relative bg-white w-11/12 max-w-lg rounded-md shadow-lg z-50 max-h-[90vh] overflow-y-auto p-6 space-y-6">
          {/* Close button */}
          <div className="flex justify-end">
            <button className="text-black font-bold text-2xl" onClick={onClose}>
              &times;
            </button>
          </div>

          {/* Section: Header (Flyer and Title) */}
          <div className="text-center space-y-4">
            {event.flyer_image && (
                <div className="w-full flex justify-center">
                  <Image
                      src={event.flyer_image}
                      alt={event.eventTitle}
                      width={300}
                      height={200}
                      className="rounded-md object-cover"
                  />
                </div>
            )}
            <h1 className="text-2xl font-bold text-black">
              {event.eventTitle || "No Title"}
            </h1>
          </div>

          {/* Section: Event Details */}
          <div className="border-t border-gray-300 pt-4 space-y-2">
            <h2 className="text-lg font-bold text-black">Event Details</h2>
            <p className="text-black">
              <span className="font-semibold">Date & Time: </span>
              {start.toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            {event.eventLocation && (
                <p className="text-black">
                  <span className="font-semibold">Location: </span>
                  {event.eventLocation}
                </p>
            )}
            {clubName && (
                <p className="text-black">
                  <span className="font-semibold">Hosted by: </span>
                  {clubName}
                </p>
            )}
            {Array.isArray(event.tags) && event.tags.length > 0 && (
                <div>
                  <span className="font-semibold">Tags: </span>
                  <TagIcons tags={event.tags} />
                </div>
            )}
          </div>

          {/* Section: Description */}
          {event.eventDescription && (
              <div className="border-t border-gray-300 pt-4">
                <h2 className="text-lg font-bold text-black">Description</h2>
                <p className="text-gray-600">{event.eventDescription}</p>
                {/* If notable_link_name and notable_link_url exist, display a button */}
                {event.notable_link_name && event.notable_link_url && (
                    <div className="mt-4">
                      <a
                          href={event.notable_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
                      >
                        {event.notable_link_name}
                      </a>
                    </div>
                )}
              </div>
          )}

          {/* Section: Map */}
          {mapUrl && (
              <div className="border-t border-gray-300 pt-4">
                <h2 className="text-lg font-bold text-black">Map</h2>
                <iframe
                    className="w-full h-48 md:h-56 rounded-md"
                    src={mapUrl}
                    allowFullScreen
                    loading="lazy"
                />
              </div>
          )}

          {/* Section: Action Button */}
          <div className="flex justify-center border-t border-gray-300 pt-4">
            <a
                href={calendarURL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800"
            >
              Add to Calendar
            </a>
          </div>
        </div>
      </div>
  );
}

export default function Events() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semester");
  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

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

  const now = new Date();
  const upcomingEvents = eventsData.filter(
      (event) => event.eventDate && event.eventDate >= now
  );
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  let displayedEvents =
      activeTab === "Weekly"
          ? upcomingEvents.filter((evt) => evt.eventDate <= oneWeekFromNow)
          : upcomingEvents;

  // Filter by selected tags
  if (selectedTags.length > 0) {
    displayedEvents = displayedEvents.filter((event) => {
      if (!Array.isArray(event.tags)) return false;
      const eventTagsLC = event.tags.map((t) => t.toLowerCase());
      return selectedTags.some((sel) => eventTagsLC.includes(sel));
    });
  }

  // Group events by day
  const eventsByDay = displayedEvents.reduce((acc, event) => {
    const day = event.eventDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {});

  return (
      <div className="min-h-screen bg-white">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-lg">
          {/* Left: Logo and Nav Links */}
          <div className="flex items-center space-x-5">
            <Link href="/">
              <Image
                  src="/images/Huddle_Social_White_Background.png"
                  alt="Huddle Social Logo"
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
              />
            </Link>
            <Link href="/events" className="text-black font-semibold flex items-center">
              <span className="mr-1">📅</span>
              Events
            </Link>
            <Link href="/housing" className="text-black font-semibold flex items-center">
              <span className="mr-1">🏠</span>
              Housing
            </Link>
          </div>

          {/* Right: Weekly, Semester, Filter */}
          <div className="flex items-center space-x-3">
            <button
                onClick={() => setActiveTab("Weekly")}
                className={`px-3 py-1 rounded-full font-bold ${
                    activeTab === "Weekly"
                        ? "bg-gray-300 text-black"
                        : "bg-white border border-black text-black"
                }`}
            >
              Weekly
            </button>
            <button
                onClick={() => setActiveTab("Semester")}
                className={`px-3 py-1 rounded-full font-bold ${
                    activeTab === "Semester"
                        ? "bg-gray-300 text-black"
                        : "bg-white border border-black text-black"
                }`}
            >
              Semester
            </button>
            <button
                onClick={() => setShowFilterModal(true)}
                className="px-3 py-1 rounded-full bg-gray-300 text-black font-bold flex items-center"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-5.414 5.414A1 1 0 0014 12.414V19l-4 2v-8.586a1 1 0 00-.293-.707L4.293 6.707A1 1 0 014 6V4z"
                />
              </svg>
              All Filters
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="py-12 container mx-auto px-6 lg:px-12">
          <h3 className="text-4xl font-bold text-black mb-6">Events</h3>
          {Object.entries(eventsByDay).map(([day, events]) => (
              <div key={day} className="mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">{day}</h2>
                <div className="border-b border-dotted border-gray-300 mb-4"></div>
                <div className="space-y-4">
                  {events.map((event) => (
                      <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="max-w-lg mx-auto bg-white border border-gray-200 rounded-md shadow-sm p-2 flex items-center space-x-2 cursor-pointer hover:shadow-md transition"
                      >
                        {event.flyer_image && (
                            <Image
                                src={event.flyer_image}
                                width={90}
                                height={90}
                                className="rounded-md object-cover"
                                alt={event.eventTitle}
                            />
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-black mb-1">
                            {event.eventTitle || "No Title"}
                          </h3>
                          <p className="text-sm text-gray-500 mb-1">
                            {event.eventDate.toLocaleString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
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

        {/* Event Popup */}
        <ModalPopUp event={selectedEvent} onClose={() => setSelectedEvent(null)} />

        {/* Filter Modal */}
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
