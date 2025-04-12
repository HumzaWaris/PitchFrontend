"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// ------------------------------------------------------
// 1. Haversine formula helper function (distance in miles)
// ------------------------------------------------------
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rlat1 = toRadians(lat1);
  const rlat2 = toRadians(lat2);

  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rlat1) *
      Math.cos(rlat2) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ImageCarousel({ images, imageClassName = "h-[25rem]" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) {
    return (
        <div className={`w-full ${imageClassName} bg-gray-200 rounded-lg flex items-center justify-center text-gray-500`}>
          No Image Available
        </div>
    );
  }
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((p) => (p + 1) % images.length);
  };
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  };
  return (
      <div className="relative">
        <img
            src={images[currentIndex]}
            alt="Housing"
            className={`w-full object-cover rounded-lg ${imageClassName}`}
        />
        {images.length > 1 && (
            <>
              <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-gray-700 px-2 py-1 rounded-full shadow"
              >
                ◀
              </button>
              <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-gray-700 px-2 py-1 rounded-full shadow"
              >
                ▶
              </button>
            </>
        )}
      </div>
  );
}

function meetsBeds(b, f) {
  if (f === "any") return true;
  if (f === "studio") return b === 0;
  if (f === "4+") return b >= 4;
  return b === parseInt(f, 10);
}

function meetsBaths(b, f) {
  if (f === "any") return true;
  if (f === "4+") return b >= 4;
  return b === parseFloat(f);
}

function UserOptionsPopup({ onLogout }) {
  return (
      <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-md p-2 z-50">
        <button
            onClick={onLogout}
            className="w-full text-black text-sm font-semibold hover:text-red-600"
        >
          Logout
        </button>
      </div>
  );
}

export default function Housing() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");
  const [showUserOptions, setShowUserOptions] = useState(false);
  const isLoggedIn = displayName !== "User";

  // -------------------------------------------------------------------------
  // Instead of a single listings state, separate raw data from computed data.
  // -------------------------------------------------------------------------
  const [rawListings, setRawListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);

  // Other state variables for selected listing, images, filter values, etc.
  const [selectedListing, setSelectedListing] = useState(null);
  const [posterName, setPosterName] = useState("");
  const [posterEmail, setPosterEmail] = useState("");
  const [imageURLs, setImageURLs] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPrice, setFilterPrice] = useState(2000);
  const [filterBeds, setFilterBeds] = useState("any");
  const [filterBaths, setFilterBaths] = useState("any");

  // ------------------------------------------------------------
  // State to store the user's location (if allowed by the user)
  // ------------------------------------------------------------
  const [userLocation, setUserLocation] = useState(null);

  // Function to request the user's location
  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.warn("Location access denied or unavailable:", error);
            setUserLocation(null);
          }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Automatically request location on mount (may trigger a prompt, depending on browser)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.warn("Auto-location request failed:", error);
            // If auto-request fails (or user declines), userLocation remains null.
            setUserLocation(null);
          }
      );
    }
  }, []);

  // Get the display name from localStorage
  useEffect(() => {
    const n = localStorage.getItem("displayname");
    if (n) setDisplayName(n);
  }, []);

  // Fetch listings data from Firestore and store in rawListings
  useEffect(() => {
    const fetchListings = async () => {
      const qs = await getDocs(collection(db, "Purdue University - Housing"));
      const data = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRawListings(data);
    };
    fetchListings();
  }, []);

  // ---------------------------------------------------------------------------
  // Compute listings with a distance value using useMemo.
  // If userLocation is available and listing contains lat/lng, calculate distance.
  // Otherwise, fall back to Firestore's "distance" parameter.
  // ---------------------------------------------------------------------------
  const computedListings = useMemo(() => {
    return rawListings.map((l) => {
      if (userLocation && l.lat != null && l.lng != null) {
        const dist = haversineDistance(userLocation.lat, userLocation.lng, l.lat, l.lng);
        return { ...l, computedDistance: dist };
      } else {
        return { ...l, computedDistance: l.distance ?? 0 };
      }
    });
  }, [rawListings, userLocation]);

  // Whenever computedListings changes, update filtered listings.
  useEffect(() => {
    setFilteredListings(computedListings);
  }, [computedListings]);

  // Fetch images for each listing (using rawListings as dependency)
  useEffect(() => {
    const storage = getStorage();
    rawListings.forEach(async (l) => {
      if (!Array.isArray(l.imagePaths)) return;
      const paths = l.imagePaths.filter((p) => p.trim() !== "");
      const urls = [];
      for (const fileName of paths) {
        const fileRef = ref(storage, `Purdue University/housing/${fileName}`);
        try {
          const url = await getDownloadURL(fileRef);
          urls.push(url);
        } catch (e) {
          if (e.code !== "storage/object-not-found") console.error(e);
        }
      }
      setImageURLs((prev) => ({ ...prev, [l.id]: urls }));
    });
  }, [rawListings]);

  // Fetch user info for the selected listing
  useEffect(() => {
    const fetchUser = async () => {
      if (selectedListing?.userId) {
        const snap = await getDoc(doc(db, "users", selectedListing.userId));
        if (snap.exists()) {
          setPosterName(snap.data().displayname || "Unknown User");
          setPosterEmail(snap.data().email || "Not Available");
        } else {
          setPosterName("Unknown User");
          setPosterEmail("Not Available");
        }
      }
    };
    if (selectedListing) fetchUser();
  }, [selectedListing]);

  // ---------------------------------------------------
  // Apply filters on the computed listings
  // ---------------------------------------------------
  const applyFilters = () => {
    const res = computedListings.filter(
        (l) =>
            meetsBeds(l.bedsCount, filterBeds) &&
            meetsBaths(l.bathsCount, filterBaths) &&
            l.myPrice <= filterPrice
    );
    setFilteredListings(res);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilterPrice(2000);
    setFilterBeds("any");
    setFilterBaths("any");
    setFilteredListings(computedListings);
    setShowFilterModal(false);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("displayname");
    router.push("/");
  };

  return (
      <section id="housing" className="min-h-screen bg-white">
        <nav className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
          <div className="flex space-x-6">
            <Link href="/">
              <Image
                  src="/images/Huddle_Social_White_Background.png"
                  alt="Huddle Social Logo"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
              />
            </Link>
            <Link href="/events" className="font-semibold text-black flex items-center hover:scale-105 transition">
              <span className="mr-1">📅</span>Events
            </Link>
            <Link href="/housing" className="font-semibold text-black flex items-center hover:scale-105 transition">
              <span className="mr-1">🏠</span>Housing
            </Link>
          </div>
          {isLoggedIn ? (
              <div
                  className="relative cursor-pointer hover:scale-105 transition"
                  onClick={() => setShowUserOptions(!showUserOptions)}
              >
                <div className="px-4 py-2 rounded-full bg-gray-200 text-black font-semibold">
                  {displayName}
                </div>
                {showUserOptions && <UserOptionsPopup onLogout={logout} />}
              </div>
          ) : (
              <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 rounded-full bg-gray-200 text-black font-semibold hover:scale-105 transition"
              >
                Sign In
              </button>
          )}
        </nav>

        <div className="py-12 container mx-auto px-6 lg:px-12">
          {/* If logged in and no location is available, show a button to request location */}
          {isLoggedIn && userLocation === null && (
              <div className="mb-4 flex justify-center">
                <button onClick={requestLocation} className="px-4 py-2 bg-blue-500 text-white rounded">
                  Enable Location for Better Distance Calculation
                </button>
              </div>
          )}

          {!isLoggedIn ? (
              <div className="text-center text-red-600 font-semibold">
                Please login to get access to the information.
              </div>
          ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-4xl font-bold text-black">
                    Housing ({filteredListings.length} listings)
                  </h3>
                  <button
                      onClick={() => setShowFilterModal(true)}
                      className="px-3 py-1 rounded-full bg-gray-300 text-black font-bold flex items-center hover:scale-105 transition"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((l) => {
                    const urls = imageURLs[l.id] || [];
                    return (
                        <div
                            key={l.id}
                            onClick={() => setSelectedListing(l)}
                            className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
                        >
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <ImageCarousel images={urls} />
                            {l.sublettingTrue && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm z-10">
                          Sublet
                        </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h2 className="text-lg font-bold text-black">{l.myHousingName}</h2>
                            <p className="text-sm text-gray-600">{l.placeName}</p>
                            <p className="text-sm text-gray-800 mt-2">
                              {l.bedsCount} bed{l.bedsCount > 1 ? "s" : ""}, {l.bathsCount} bath{l.bathsCount > 1 ? "s" : ""} | ${l.myPrice} per person
                            </p>

                            {/* Display estimated distance (from computedDistance) above move-in info */}
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex flex-col">
                                <p className="text-green-600 text-sm">
                                  Est. {Number(l.computedDistance).toFixed(1)} miles
                                </p>
                                <p className="text-green-600 text-sm">
                                  {l.moveInDate
                                      ? l.moveInDate
                                          .toDate()
                                          .toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                      : "No move-in date"}
                                </p>
                              </div>
                              <span
                                  className={`text-sm font-semibold px-3 py-1 rounded-full text-white ${
                                      l.genderType === "Male"
                                          ? "bg-blue-500"
                                          : l.genderType === "Female"
                                              ? "bg-pink-500"
                                              : "bg-purple-500"
                                  }`}
                              >
                          {l.genderType || "Co-ed"}
                        </span>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              </>
          )}
        </div>

        {isLoggedIn && selectedListing && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setSelectedListing(null)}
            >
              <div
                  className="relative bg-white w-11/12 max-w-3xl rounded-md shadow-lg p-8 pt-10 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
              >
                <button
                    onClick={() => setSelectedListing(null)}
                    className="absolute top-3 right-3 text-black text-3xl font-bold hover:scale-110 transition"
                >
                  &times;
                </button>
                {(() => {
                  const urls = imageURLs[selectedListing.id] || [];
                  return urls.length ? (
                      <ImageCarousel images={urls} imageClassName="h-[20rem]" />
                  ) : (
                      <div className="w-full h-[20rem] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                        No Image Available
                      </div>
                  );
                })()}
                <h2 className="text-3xl font-semibold mt-6 text-black">
                  {selectedListing.myHousingName}
                </h2>
                <p className="text-xl font-semibold text-black mt-2">${selectedListing.myPrice} per person</p>
                <hr className="my-4 border-gray-300" />
                <p className="text-lg font-semibold text-black uppercase">Other Information</p>
                <p className="mt-2 text-black">
                  {selectedListing.descriptionText || "No description provided"}
                </p>
                <hr className="my-4 border-gray-300" />
                <p className="text-lg font-semibold text-black uppercase">What's Included</p>
                <p className="text-black mt-2">
                  {selectedListing.includesUtilities || selectedListing.includesAmenities
                      ? `${selectedListing.includesUtilities ? "Utilities Included" : ""}${
                          selectedListing.includesUtilities && selectedListing.includesAmenities ? " | " : ""
                      }${selectedListing.includesAmenities ? "Amenities Included" : ""}`
                      : "No utilities or amenities specified"}
                </p>
                <hr className="my-4 border-gray-300" />
                <p className="text-lg font-semibold text-black uppercase">Contact</p>
                <p className="text-black mt-2">
                  <strong>Posted by:</strong> {posterName}
                </p>
                <div className="mt-2 text-black">
                  <p>
                    <strong>Move-in Date:</strong>{" "}
                    {selectedListing.moveInDate
                        .toDate()
                        .toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  <p className="mt-2">
                    <strong>Move-out Date:</strong>{" "}
                    {selectedListing.moveOutDate
                        .toDate()
                        .toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <button
                    onClick={() => alert(`Email: ${posterEmail}`)}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg mt-6"
                >
                  Get Email
                </button>
              </div>
            </div>
        )}

        {isLoggedIn && showFilterModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={() => setShowFilterModal(false)}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <div
                  className="relative w-11/12 max-w-md bg-white rounded-md shadow-lg p-8 pt-10 z-50"
                  onClick={(e) => e.stopPropagation()}
              >
                <button
                    onClick={() => setShowFilterModal(false)}
                    className="absolute top-3 right-3 text-black text-3xl font-bold hover:scale-110 transition"
                >
                  &times;
                </button>
                <h2 className="text-black text-2xl font-bold text-center mb-6">Filter Options</h2>
                <label className="block text-sm text-black mb-1">
                  Max Price: <strong>${filterPrice}</strong>
                </label>
                <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filterPrice}
                    onChange={(e) => setFilterPrice(Number(e.target.value))}
                    className="w-full accent-purple-500 mb-6"
                />
                <label className="block text-sm text-black mb-1">
                  Beds: <strong>{filterBeds}</strong>
                </label>
                <select
                    className="w-full mb-4 border border-gray-300 rounded-md p-2 focus:outline-none text-black"
                    value={filterBeds}
                    onChange={(e) => setFilterBeds(e.target.value)}
                >
                  <option value="any">Any</option>
                  <option value="studio">Studio</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
                <label className="block text-sm text-black mb-1">
                  Baths: <strong>{filterBaths}</strong>
                </label>
                <select
                    className="w-full mb-6 border border-gray-300 rounded-md p-2 focus:outline-none text-black"
                    value={filterBaths}
                    onChange={(e) => setFilterBaths(e.target.value)}
                >
                  <option value="any">Any</option>
                  <option value="1">1</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2</option>
                  <option value="2.5">2.5</option>
                  <option value="3">3</option>
                  <option value="3.5">3.5</option>
                  <option value="4+">4+</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                      onClick={clearFilters}
                      className="px-3 py-1 rounded-full bg-white border border-black text-black font-bold hover:bg-gray-100 transition"
                  >
                    Clear
                  </button>
                  <button
                      onClick={() => setShowFilterModal(false)}
                      className="px-3 py-1 rounded-full bg-white border border-black text-black font-bold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={applyFilters}
                      className="px-3 py-1 rounded-full bg-gray-300 text-black font-bold hover:scale-105 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
        )}
      </section>
  );
}
