"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Add interfaces at the top of the file after imports
interface Listing {
  id: string;
  myHousingName: string;
  placeName: string;
  bedsCount: string | number;
  bathsCount: string | number;
  myPrice: number;
  moveInDate: any; // Firebase Timestamp
  moveOutDate: any; // Firebase Timestamp
  sublettingTrue?: boolean;
  gender: string; // Changed from genderType to match Firebase field name
  latitude?: number;
  longitude?: number;
  distance?: number;
  allAmenities: string[];
  allUtilities: string[];
  descriptionText?: string;
  includesUtilities?: boolean;
  includesAmenities?: boolean;
  userId: string;
  imagePaths: string[];
  computedDistance?: number;
}

// ------------------------------------------------------
// 1. Haversine formula helper function (distance in miles)
// ------------------------------------------------------
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const toRadians = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rlat1 = toRadians(lat1);
  const rlat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dLon / 2) ** 2;
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
  
  // Convert b to number since it comes as string from Firebase
  const bedsCount = Number(b);
  
  if (f === "studio") return bedsCount === 0;
  if (f === "4+") return bedsCount >= 4;
  
  // Compare with the numeric value
  return bedsCount === Number(f);
}

function meetsBaths(b, f) {
  if (f === "any") return true;
  
  // Convert b to number since it comes as string from Firebase
  const bathsCount = Number(b);
  
  if (f === "4+") return bathsCount >= 4;
  
  // Compare with the numeric value
  return bathsCount === Number(f);
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
  const [rawListings, setRawListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  // Other state variables for selected listing, images, filter values, etc.
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [posterName, setPosterName] = useState("");
  const [posterEmail, setPosterEmail] = useState("");
  const [imageURLs, setImageURLs] = useState<{[key: string]: string[]}>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPrice, setFilterPrice] = useState(0);
  const [filterBeds, setFilterBeds] = useState("any");
  const [filterBaths, setFilterBaths] = useState("any");
  const [sortOption, setSortOption] = useState("");
  const [moveInStartMonth, setMoveInStartMonth] = useState("");
  const [moveInStartYear, setMoveInStartYear] = useState("");
  const [moveInEndMonth, setMoveInEndMonth] = useState("");
  const [moveInEndYear, setMoveInEndYear] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedGender, setSelectedGender] = useState("any");
  const [maxMilesRange, setMaxMilesRange] = useState(100);

  // ------------------------------------------------------------
  // State to store the user's location (if allowed by the user)
  // ------------------------------------------------------------
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Add state for location permission status
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'pending'>('pending');

  const amenitiesList = [
    "Pool",
    "Pets-Allowed",
    "Gym",
    "Parking",
    "Community Spaces",
    "Close Bus Stop",
    "Laundry",
    "Furnished"
  ];

  // Function to request and handle location permissions
  const requestLocation = async () => {
    try {
      if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser");
        setLocationPermissionStatus('denied');
        return;
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        setLocationPermissionStatus('denied');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('User location:', newLocation); // Debug log
          setUserLocation(newLocation);
          setLocationPermissionStatus('granted');
          
          // Immediately recalculate distances with new location
          const updatedListings = rawListings.map(l => {
            let computedDistance = l.distance || 0;
            if (l.latitude && l.longitude) {
              computedDistance = haversineDistance(
                newLocation.lat,
                newLocation.lng,
                Number(l.latitude),
                Number(l.longitude)
              );
              console.log('Listing distance:', l.myHousingName, computedDistance); // Debug log
            }
            return { ...l, computedDistance };
          });
          
          // Apply current filters to updated listings
          const filteredResults = updatedListings.filter(
            (l) =>
              meetsBeds(l.bedsCount, filterBeds) &&
              meetsBaths(l.bathsCount, filterBaths) &&
              (filterPrice === 0 || l.myPrice <= filterPrice) &&
              meetsDateRange(l.moveInDate) &&
              meetsAmenitiesFilter(l) &&
              meetsGenderFilter(l)
          );
          
          const sortedResults = sortListings(filteredResults);
          setFilteredListings(sortedResults);
        },
        (error) => {
          console.warn("Error getting location:", error);
          setLocationPermissionStatus('denied');
        }
      );
    } catch (error) {
      console.error("Error requesting location:", error);
      setLocationPermissionStatus('denied');
    }
  };

  // Update useEffect to handle location changes
  useEffect(() => {
    if (userLocation && rawListings.length > 0) {
      console.log('Recalculating distances with user location:', userLocation); // Debug log
      // Recalculate distances whenever location or listings change
      const updatedListings = rawListings.map(l => {
        let computedDistance = l.distance || 0;
        if (l.latitude && l.longitude) {
          computedDistance = haversineDistance(
            userLocation.lat,
            userLocation.lng,
            Number(l.latitude),
            Number(l.longitude)
          );
          console.log('Updated distance for:', l.myHousingName, computedDistance); // Debug log
        }
        return { ...l, computedDistance };
      });
      
      // Apply current filters to updated listings
      const filteredResults = updatedListings.filter(
        (l) =>
          meetsBeds(l.bedsCount, filterBeds) &&
          meetsBaths(l.bathsCount, filterBaths) &&
          (filterPrice === 0 || l.myPrice <= filterPrice) &&
          meetsDateRange(l.moveInDate) &&
          meetsAmenitiesFilter(l) &&
          meetsGenderFilter(l)
      );
      
      const sortedResults = sortListings(filteredResults);
      setFilteredListings(sortedResults);
    }
  }, [userLocation, rawListings]);

  // Get the display name from localStorage
  useEffect(() => {
    const n = localStorage.getItem("displayname");
    if (n) setDisplayName(n);
  }, []);

  // Fetch listings data from Firestore and store in rawListings
  useEffect(() => {
    const fetchListings = async () => {
      if (!db) return;
      const qs = await getDocs(collection(db, "Purdue University - Housing"));
      const data = qs.docs.map((d) => ({ 
        id: d.id, 
        ...d.data(),
        allAmenities: d.data().allAmenities || []
      } as Listing));
      setRawListings(data);
    };
    fetchListings();
  }, [db]);

  // ---------------------------------------------------------------------------
  // Compute listings with a distance value using useMemo.
  // If userLocation is available and listing contains lat/lng, calculate distance.
  // Otherwise, fall back to Firestore's "distance" parameter.
  // ---------------------------------------------------------------------------
  const computedListings = useMemo(() => {
    return rawListings.map((l) => {
      let computedDistance = l.distance || 0; // Default to Firebase distance

      if (userLocation && l.latitude && l.longitude) {
        // Calculate Haversine distance if we have user location and listing coordinates
        computedDistance = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          Number(l.latitude),
          Number(l.longitude)
        );
      }

      return { ...l, computedDistance };
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

  // Add sorting function
  const sortListings = (listings) => {
    if (!sortOption) return listings;
    
    return [...listings].sort((a, b) => {
      switch (sortOption) {
        case "distance-asc":
          return a.computedDistance - b.computedDistance;
        case "distance-desc":
          return b.computedDistance - a.computedDistance;
        case "price-asc":
          return a.myPrice - b.myPrice;
        case "price-desc":
          return b.myPrice - a.myPrice;
        default:
          return 0;
      }
    });
  };

  // Add helper function to get formatted date string
  const getFormattedDate = (month, year) => {
    if (!month || !year) return null;
    return `${year}-${month.padStart(2, '0')}`;
  };

  // Add date range check function
  const meetsDateRange = (moveInDate) => {
    if (!moveInDate) return false;
    
    const startDate = getFormattedDate(moveInStartMonth, moveInStartYear);
    const endDate = getFormattedDate(moveInEndMonth, moveInEndYear);
    
    if (!startDate && !endDate) return true;

    const listingDate = moveInDate.toDate();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return listingDate >= start && listingDate <= end;
    } else if (start) {
      return listingDate >= start;
    } else if (end) {
      return listingDate <= end;
    }
    return true;
  };

  // Update amenities check function to match Firebase array structure
  const meetsAmenitiesFilter = (listing: Listing) => {
    if (selectedAmenities.length === 0) return true;
    
    // Check if the listing has the selected amenities
    return selectedAmenities.every(selectedAmenity => 
      listing.allAmenities?.includes(selectedAmenity)
    );
  };

  // Update gender check function to handle the correct field name
  const meetsGenderFilter = (listing: Listing) => {
    if (selectedGender === "any") return true;
    if (!listing.gender) return false;
    // Handle both "Co-ed" and "Coed" variations
    if (selectedGender === "Co-ed") {
      return listing.gender === "Co-ed" || listing.gender === "Coed";
    }
    return listing.gender === selectedGender;
  };

  // Add distance range check function
  const meetsDistanceFilter = (listing: Listing) => {
    if (!userLocation || maxMilesRange === 100) return true;
    const distance = listing.computedDistance || listing.distance || 0;
    return distance <= maxMilesRange;
  };

  // Update applyFilters to include distance filter
  const applyFilters = () => {
    const res = computedListings.filter(
      (l) =>
        meetsBeds(l.bedsCount, filterBeds) &&
        meetsBaths(l.bathsCount, filterBaths) &&
        (filterPrice === 0 || l.myPrice <= filterPrice) &&
        meetsDateRange(l.moveInDate) &&
        meetsAmenitiesFilter(l) &&
        meetsGenderFilter(l) &&
        meetsDistanceFilter(l)
    );
    const sortedRes = sortListings(res);
    setFilteredListings(sortedRes);
    setShowFilterModal(false);
  };

  // Update clearFilters to properly reset all listings
  const clearFilters = () => {
    // Reset all filter states
    setFilterPrice(0);
    setFilterBeds("any");
    setFilterBaths("any");
    setSortOption("");
    setMoveInStartMonth("");
    setMoveInStartYear("");
    setMoveInEndMonth("");
    setMoveInEndYear("");
    setSelectedAmenities([]);
    setSelectedGender("any");
    setMaxMilesRange(100);

    // Reset to all listings from computedListings
    const allListings = computedListings.map(listing => ({
      ...listing,
      computedDistance: userLocation && listing.latitude && listing.longitude
        ? haversineDistance(
            userLocation.lat,
            userLocation.lng,
            Number(listing.latitude),
            Number(listing.longitude)
          )
        : listing.distance || 0
    }));

    setFilteredListings(allListings);
    setShowFilterModal(false);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("displayname");
    router.push("/");
  };

  return (
    <section id="housing" className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-lg">
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
          <Link href="/events" className="text-black font-semibold flex items-center hover:scale-105 transition">
            <span className="mr-1">📅</span>Events
          </Link>
          <Link href="/housing" className="text-black font-semibold flex items-center hover:scale-105 transition">
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
              {showUserOptions && <UserOptionsPopup onLogout={logout}/>}
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
        {!isLoggedIn ? (
            <div className="text-center text-red-600 font-semibold">Please login to get access to the information.</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-4xl font-bold text-black">Housing</h3>
              <div className="flex space-x-3">
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
            </div>

            {/* Location Permission Banner */}
            {locationPermissionStatus === 'pending' && (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <div className="py-1">
                    <svg className="h-6 w-6 text-blue-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Location Access Required</p>
                    <p className="text-sm">Please enable location services to see housing options near you.</p>
                  </div>
                  <button
                    onClick={requestLocation}
                    className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Enable Location
                  </button>
                </div>
              </div>
            )}

            {/* Location Denied Banner */}
            {isLoggedIn && locationPermissionStatus === 'denied' && (
              <div className="mb-6 bg-yellow-50 p-4 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-700">
                  Using approximate distances. Enable location in your browser settings for accurate distances.
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-black">
                  ({filteredListings.length} listings)
                </h1>
              </div>

              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          {l.sublettingTrue ? (
                              <span className="absolute top-4 left-5 bg-green-500 text-white px-3 py-1 rounded-full text-sm z-10">
                                Sublet
                              </span>
                          ) : (
                              <span className="absolute top-4 left-5 bg-blue-500 text-white px-3 py-1 rounded-full text-sm z-10">
                                Roommate
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
                                className={`text-sm font-semibold px-3 py-1 rounded-full text-white cursor-pointer ${
                                    l.gender === "Male"
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : l.gender === "Female"
                                            ? "bg-pink-500 hover:bg-pink-600"
                                            : "bg-purple-500 hover:bg-purple-600"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGender(l.gender);
                                  setShowFilterModal(true);
                                }}
                            >
                              {l.gender}
                            </span>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Modal */}
      {isLoggedIn && showFilterModal && (
          <div
              className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
              onClick={() => setShowFilterModal(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div
                className="relative w-11/12 max-w-4xl bg-white rounded-lg shadow-lg p-8 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
              <button
                  onClick={() => setShowFilterModal(false)}
                  className="absolute top-4 right-4 text-black text-3xl font-bold hover:scale-110 transition"
              >
                &times;
              </button>
              <h2 className="text-black text-3xl font-bold text-center mb-6">Filter Options</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Sort By Section */}
                  <div>
                    <label className="block text-base font-semibold text-black mb-2">
                      Sort By
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="">Select sorting option</option>
                      <option value="distance-asc">Distance (Ascending)</option>
                      <option value="distance-desc">Distance (Descending)</option>
                      <option value="price-asc">Price (Ascending)</option>
                      <option value="price-desc">Price (Descending)</option>
                    </select>
                  </div>

                  {/* Price Section */}
                  <div>
                    <label className="block text-base font-semibold text-black mb-2">
                      Max Price: <strong>${filterPrice === 0 ? "No limit" : filterPrice}</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(Number(e.target.value))}
                      className="w-full h-2 accent-purple-500"
                    />
                  </div>

                  {/* Beds & Baths Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-semibold text-black mb-2">
                        Beds
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
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
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-black mb-2">
                        Baths
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
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
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Move-in Date Range Section */}
                  <div>
                    <label className="block text-base font-semibold text-black mb-2">
                      Move-In Date Range
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                        <div className="flex gap-3">
                          <select
                            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
                            value={moveInStartMonth}
                            onChange={(e) => setMoveInStartMonth(e.target.value)}
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = (i + 1).toString().padStart(2, '0');
                              const date = new Date(2024, i, 1);
                              return (
                                <option key={month} value={month}>
                                  {date.toLocaleString('default', { month: 'long' })}
                                </option>
                              );
                            })}
                          </select>
                          <select
                            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
                            value={moveInStartYear}
                            onChange={(e) => setMoveInStartYear(e.target.value)}
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 3 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <option key={year} value={year}>{year}</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">End Date</label>
                        <div className="flex gap-3">
                          <select
                            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
                            value={moveInEndMonth}
                            onChange={(e) => setMoveInEndMonth(e.target.value)}
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = (i + 1).toString().padStart(2, '0');
                              const date = new Date(2024, i, 1);
                              return (
                                <option key={month} value={month}>
                                  {date.toLocaleString('default', { month: 'long' })}
                                </option>
                              );
                            })}
                          </select>
                          <select
                            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none text-black"
                            value={moveInEndYear}
                            onChange={(e) => setMoveInEndYear(e.target.value)}
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 3 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <option key={year} value={year}>{year}</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gender Section */}
                  <div>
                    <label className="block text-base font-semibold text-black mb-2">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["any", "Male", "Female", "Coed"].map((gender) => (
                        <div 
                          key={gender} 
                          className={`flex items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${
                            selectedGender === gender ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            setSelectedGender(gender);
                            // Apply filters immediately when selecting gender
                            const res = computedListings.filter(
                              (l) =>
                                meetsBeds(l.bedsCount, filterBeds) &&
                                meetsBaths(l.bathsCount, filterBaths) &&
                                (filterPrice === 0 || l.myPrice <= filterPrice) &&
                                meetsDateRange(l.moveInDate) &&
                                meetsAmenitiesFilter(l) &&
                                (gender === "any" || 
                                 (gender === "Coed" ? (l.gender === "Coed" || l.gender === "Co-ed") : l.gender === gender))
                            );
                            const sortedRes = sortListings(res);
                            setFilteredListings(sortedRes);
                          }}
                        >
                          <input
                            type="radio"
                            id={`gender-${gender}`}
                            name="gender"
                            value={gender}
                            checked={selectedGender === gender}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`gender-${gender}`} 
                            className="ml-2 text-base text-gray-700 cursor-pointer select-none flex-grow"
                          >
                            {gender === "any" ? "Any" : gender}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div>
                    <label className="block text-base font-semibold text-black mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesList.map((amenity) => (
                        <div key={amenity} className="flex items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100">
                          <input
                            type="checkbox"
                            id={amenity}
                            checked={selectedAmenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmenities([...selectedAmenities, amenity]);
                              } else {
                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={amenity} className="ml-2 text-base text-gray-700 cursor-pointer select-none">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Distance Range Section at the bottom */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-base font-semibold text-black mb-2">
                  Maximum Distance: <strong>{maxMilesRange.toFixed(1)} ± 0.2 miles</strong>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={maxMilesRange}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setMaxMilesRange(value);
                    // Optionally apply filters immediately
                    const res = computedListings.filter(
                      (l) =>
                        meetsBeds(l.bedsCount, filterBeds) &&
                        meetsBaths(l.bathsCount, filterBaths) &&
                        (filterPrice === 0 || l.myPrice <= filterPrice) &&
                        meetsDateRange(l.moveInDate) &&
                        meetsAmenitiesFilter(l) &&
                        meetsGenderFilter(l) &&
                        ((l.computedDistance || l.distance || 0) <= value)
                    );
                    const sortedRes = sortListings(res);
                    setFilteredListings(sortedRes);
                  }}
                  className="w-full h-2 accent-purple-500"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0.5 mi</span>
                  <span>50 mi</span>
                  <span>100 mi</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                <button
                    onClick={clearFilters}
                    className="px-6 py-2 rounded-lg bg-white border-2 border-black text-black font-bold hover:bg-gray-100 transition"
                >
                  Clear
                </button>
                <button
                    onClick={() => setShowFilterModal(false)}
                    className="px-6 py-2 rounded-lg bg-white border-2 border-black text-black font-bold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                    onClick={applyFilters}
                    className="px-6 py-2 rounded-lg bg-gray-900 text-white font-bold hover:bg-gray-800 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
      )}

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
    </section>
  );
}
