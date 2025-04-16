"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseConfig";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import GroupsIcon from "@mui/icons-material/Groups";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SchoolIcon from "@mui/icons-material/School";
import BuildIcon from "@mui/icons-material/Build";
import CelebrationIcon from "@mui/icons-material/Celebration";
import PublicIcon from "@mui/icons-material/Public";
import FastfoodIcon from "@mui/icons-material/Fastfood";
const tagIcon = {
  games: <SportsEsportsIcon style={{ color: "black" }} />,
  sports: <SportsSoccerIcon style={{ color: "black" }} />,
  clubs: <GroupsIcon style={{ color: "black" }} />,
  music: <MusicNoteIcon style={{ color: "black" }} />,
  education: <SchoolIcon style={{ color: "black" }} />,
  project: <BuildIcon style={{ color: "black" }} />,
  party: <CelebrationIcon style={{ color: "black" }} />,
  culture: <PublicIcon style={{ color: "black" }} />,
  "free food": <FastfoodIcon style={{ color: "black" }} />,
};

function TagIcons({ tags = [] }) {
  return (
    <div className="flex space-x-2 mt-2">
      {tags.map((t, i) => (
        <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white">
          {tagIcon[t.toLowerCase()] || <BuildIcon style={{ color: "black" }} />}
        </span>
      ))}
    </div>
  );
}

function FilterModal({ onClose, selectedTags, setSelectedTags }) {
  const all = [
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
  const toggle = (v) =>
    selectedTags.includes(v)
      ? setSelectedTags(selectedTags.filter((t) => t !== v))
      : setSelectedTags([...selectedTags, v]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-11/12 max-w-md bg-white rounded-md shadow-lg p-4 z-50">
        <button className="absolute top-2 right-2 text-2xl text-black font-bold hover:scale-110 transition" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-black text-2xl font-bold text-center mb-4">Choose Event Types</h2>
        <div className="flex flex-col space-y-2">
          {all.map((f) => {
            const sel = selectedTags.includes(f.value);
            return (
              <button
                key={f.value}
                onClick={() => toggle(f.value)}
                className={`w-full py-2 px-3 rounded-md flex items-center space-x-2 border ${
                  sel ? "bg-gray-200" : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">{f.icon}</div>
                <span className="text-black font-bold">{f.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded-md font-bold hover:scale-105 transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function UserOptionsPopup({ onLogout }) {
  return (
    <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-md p-2 z-50">
      <button onClick={onLogout} className="w-full text-black text-sm font-semibold hover:text-red-600">
        Logout
      </button>
    </div>
  );
}

function ModalPopUp({ event, onClose }) {
  const [clubName, setClubName] = useState("");
  useEffect(() => {
    const f = async () => {
      if (event?.clubID) {
        const snap = await getDoc(doc(db, "Clubs", event.clubID));
        if (snap.exists()) setClubName(snap.data().clubName || "");
      }
    };
    f();
  }, [event]);
  if (!event) return null;
  const start = new Date(event.eventDate);
  const end = new Date(start.getTime() + 3600000);
  const iso = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.eventTitle || "Event"
  )}&dates=${iso(start)}%2F${iso(end)}&details=${encodeURIComponent(event.eventDescription || "")}&location=${encodeURIComponent(
    event.eventLocation || ""
  )}`;
  const hasMap = event.latitude && event.longitude && (event.latitude !== 0 || event.longitude !== 0);
  const mapUrl = hasMap ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=es;z=14&output=embed` : null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-11/12 max-w-3xl rounded-md shadow-lg z-50 max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex justify-end">
          <button className="text-black font-bold text-2xl hover:scale-110 transition" onClick={onClose}>
            &times;
          </button>
        </div>
        {event.flyer_image && (
          <div className="w-full flex justify-center">
            <Image src={event.flyer_image} alt={event.eventTitle} width={400} height={250} className="rounded-md object-cover" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-black text-center">{event.eventTitle || "No Title"}</h1>
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
              <span className="font-semibold text-black">Tags: </span>
              <TagIcons tags={event.tags} />
            </div>
          )}
        </div>
        {event.eventDescription && (
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-lg font-bold text-black">Description</h2>
            <p className="text-gray-600">{event.eventDescription}</p>
          </div>
        )}
        {event.notable_link_name && event.notable_link_url && (
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-lg font-bold text-black mb-2">Additional Information</h2>
            <a
              href={event.notable_link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-semibold hover:bg-blue-600 transition"
            >
              {event.notable_link_name}
            </a>
          </div>
        )}
        {mapUrl && (
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-lg font-bold text-black">Map</h2>
            <iframe className="w-full h-64 rounded-md" src={mapUrl} loading="lazy" />
          </div>
        )}
        <div className="flex justify-center border-t border-gray-300 pt-4">
          <a href={calendarURL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-800">
            Add to Calendar
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [eventsData, setEventsData] = useState([]);
  const [activeTab, setActiveTab] = useState("Semester");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [visibleDays, setVisibleDays] = useState(3);
  const [infiniteTarget, setInfiniteTarget] = useState(null);

  useEffect(() => {
    const n = localStorage.getItem("displayname");
    if (n) setDisplayName(n);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const n = snap.data().displayname || user.displayName || "User";
        setDisplayName(n);
        localStorage.setItem("displayname", n);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "Purdue University"), orderBy("eventDate", "asc"));
    const unsub = onSnapshot(q, (s) => {
      const ev = s.docs.map((d) => {
        const data = d.data();
        const dt = data.eventDate?.toDate ? data.eventDate.toDate() : new Date(data.eventDate);
        return { id: d.id, ...data, eventDate: dt };
      });
      setEventsData(ev);
    });
    return () => unsub();
  }, []);

  const now = new Date();
  const upcomingEvents = eventsData.filter((evt) => evt.eventDate && evt.eventDate >= now);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  let displayedEvents = activeTab === "Weekly" ? upcomingEvents.filter((evt) => evt.eventDate <= oneWeekFromNow) : upcomingEvents;
  if (selectedTags.length > 0) {
    displayedEvents = displayedEvents.filter((evt) => {
      if (!Array.isArray(evt.tags)) return false;
      const t = evt.tags.map((tag) => tag.toLowerCase());
      return selectedTags.some((sel) => t.includes(sel));
    });
  }

  const eventsByDay = displayedEvents.reduce((acc, evt) => {
    const dayStr =
      activeTab === "Weekly"
        ? evt.eventDate.toLocaleDateString("en-US", { weekday: "long" })
        : evt.eventDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
    (acc[dayStr] ||= []).push(evt);
    return acc;
  }, {});
  const sortedDayKeys = Object.keys(eventsByDay).sort((a, b) => new Date(a) - new Date(b));
  const dayKeysToShow = sortedDayKeys.slice(0, visibleDays);

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && visibleDays < sortedDayKeys.length) setVisibleDays((p) => p + 3);
    },
    [sortedDayKeys, visibleDays]
  );

  useEffect(() => {
    if (!infiniteTarget) return;
    const ob = new IntersectionObserver(handleObserver, { threshold: 1 });
    ob.observe(infiniteTarget);
    return () => ob.disconnect();
  }, [infiniteTarget, handleObserver]);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("displayname");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-lg">
        <div className="flex items-center space-x-5">
          <Link href="/">
            <Image src="/images/Huddle_Social_White_Background.png" alt="Logo" width={50} height={50} className="rounded-full object-cover" />
          </Link>
          <Link href="/events" className="text-black font-semibold flex items-center hover:scale-105 transition">
            <span className="mr-1">📅</span>Events
          </Link>
          <Link href="/housing" className="text-black font-semibold flex items-center hover:scale-105 transition">
            <span className="mr-1">🏠</span>Housing
          </Link>
        </div>
        {displayName === "User" ? (
          <button onClick={() => router.push("/login")} className="px-4 py-2 rounded-full bg-gray-200 text-black font-semibold hover:scale-105 transition">
            Sign In
          </button>
        ) : (
          <div className="relative cursor-pointer hover:scale-105 transition" onClick={() => setShowUserOptions(!showUserOptions)}>
            <div className="px-4 py-2 rounded-full bg-gray-200 text-black font-semibold">{displayName}</div>
            {showUserOptions && <UserOptionsPopup onLogout={logout} />}
          </div>
        )}
      </nav>

      <div className="py-12 container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-4xl font-bold text-black">Events</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab("Weekly")}
              className={`px-3 py-1 rounded-full font-bold transition ${
                activeTab === "Weekly" ? "bg-gray-300 text-black" : "bg-white border border-black text-black hover:bg-gray-100"
              } hover:scale-105`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab("Semester")}
              className={`px-3 py-1 rounded-full font-bold transition ${
                activeTab === "Semester" ? "bg-gray-300 text-black" : "bg-white border border-black text-black hover:bg-gray-100"
              } hover:scale-105`}
            >
              Semester
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-3 py-1 rounded-full bg-gray-300 text-black font-bold flex items-center hover:scale-105 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1
                    1 0 011 1v2a1 1 0 01-.293.707l-5.414 5.414A1 1 0 0014 12.414V19l-4
                    2v-8.586a1 1 0 00-.293-.707L4.293
                    6.707A1 1 0 014 6V4z" />
              </svg>
              All Filters
            </button>
          </div>
        </div>
        {dayKeysToShow.map((day) => (
          <div key={day} className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">{day}</h2>
            <div className="border-b border-dotted border-gray-300 mb-4"></div>
            <div className="space-y-4">
              {eventsByDay[day].map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-md shadow-sm p-3 flex items-center space-x-4 cursor-pointer hover:shadow-lg transition w-full"
                >
                  {evt.flyer_image && <Image src={evt.flyer_image} width={120} height={120} className="rounded-md object-cover" alt={evt.eventTitle} />}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black mb-1">{evt.eventTitle || "No Title"}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {evt.eventDate.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                    </p>
                    <p className="text-sm text-gray-700">{evt.eventLocation || "No Address"}</p>
                    <TagIcons tags={evt.tags || []} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={setInfiniteTarget} className="h-10"></div>
      </div>

      {selectedEvent && <ModalPopUp event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showFilterModal && <FilterModal onClose={() => setShowFilterModal(false)} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />}
    </div>
  );
}
