"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// A simple button component for convenience
function Button({ children, onClick, variant = "default" }) {
    const baseClass =
        "px-4 py-2 text-sm font-semibold rounded-md transition-colors";
    const variants = {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    };
    return (
        <button className={`${baseClass} ${variants[variant]}`} onClick={onClick}>
            {children}
        </button>
    );
}

// A small image carousel that loops through the `images` array.
// It accepts an optional `imageClassName` prop to control the image's height.
// By default, grid tiles use a height of 12.5rem (~1.25x h-40).
function ImageCarousel({ images, imageClassName = "h-[12.5rem]" }) {
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
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative">
            <img
                src={images[currentIndex]}
                alt="Housing"
                className={`w-full object-cover rounded-lg ${imageClassName}`}
            />

            {/* Show arrows only if there is more than one image */}
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

// Return TRUE if the listing's bed count matches the selected filter
function meetsBeds(listingBeds, filterBeds) {
    if (filterBeds === "any") return true;
    if (filterBeds === "studio") {
        // We assume 'studio' means listingBeds === 0
        return listingBeds === 0;
    }
    if (filterBeds === "4+") {
        return listingBeds >= 4;
    }
    // Otherwise parse the integer
    const bedNum = parseInt(filterBeds, 10);
    return listingBeds === bedNum;
}

// Return TRUE if the listing's bath count matches the selected filter
function meetsBaths(listingBaths, filterBaths) {
    if (filterBaths === "any") return true;
    if (filterBaths === "4+") {
        return listingBaths >= 4;
    }
    // Otherwise parse the float
    const bathNum = parseFloat(filterBaths);
    return listingBaths === bathNum;
}

export default function Housing() {
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);

    // For fetching the "Posted by" info
    const [posterName, setPosterName] = useState("");
    const [posterEmail, setPosterEmail] = useState("");

    // For images
    const [imageURLs, setImageURLs] = useState({});

    // Controls the visibility of the Filters bottom sheet
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filterPrice, setFilterPrice] = useState(2000);
    const [filterBeds, setFilterBeds] = useState("any"); // "studio", "1", "2", ...
    const [filterBaths, setFilterBaths] = useState("any"); // "1", "1.5", "2", etc.

    // 1) Fetch listings from Firestore
    useEffect(() => {
        const fetchListings = async () => {
            const querySnapshot = await getDocs(
                collection(db, "Purdue University - Housing")
            );
            const data = querySnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            setListings(data);
            setFilteredListings(data);
        };
        fetchListings();
    }, []);

    // 2) Convert each short file name to a real download URL
    useEffect(() => {
        const storage = getStorage();
        listings.forEach(async (listing) => {
            if (!Array.isArray(listing.imagePaths)) return;
            const validPaths = listing.imagePaths.filter((p) => p.trim() !== "");
            const urls = [];
            for (const fileName of validPaths) {
                const fileRef = ref(storage, `Purdue University/housing/${fileName}`);
                try {
                    const downloadURL = await getDownloadURL(fileRef);
                    urls.push(downloadURL);
                } catch (error) {
                    if (error.code === "storage/object-not-found") {
                        console.warn(`File not found in Storage: ${fileName}`);
                    } else {
                        console.error("Error fetching download URL:", error);
                    }
                }
            }
            setImageURLs((prev) => ({ ...prev, [listing.id]: urls }));
        });
    }, [listings]);

    // 3) Fetch user details (from "Users" collection) when modal opens
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (selectedListing?.userId) {
                const userRef = doc(db, "users", selectedListing.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    // Use displayName instead of name
                    setPosterName(userSnap.data().displayName || "Unknown User");
                    setPosterEmail(userSnap.data().email || "Not Available");
                } else {
                    setPosterName("Unknown User");
                    setPosterEmail("Not Available");
                }
            }
        };
        if (selectedListing) {
            fetchUserDetails();
        }
    }, [selectedListing]);

    // Filtering logic
    const handleApply = () => {
        const underPrice = listings.filter((listing) => {
            const priceOk = listing.myPrice <= filterPrice;
            const bedsOk = meetsBeds(listing.bedsCount, filterBeds);
            const bathsOk = meetsBaths(listing.bathsCount, filterBaths);
            return priceOk && bedsOk && bathsOk;
        });
        setFilteredListings(underPrice);
        setShowFilters(false);
    };

    const handleClear = () => {
        setFilterPrice(2000);
        setFilterBeds("any");
        setFilterBaths("any");
        setFilteredListings(listings);
        setShowFilters(false);
    };

    const handleCancel = () => {
        setShowFilters(false);
    };

    return (
        <section id="housing" className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
                <div className="flex space-x-6">
                    {/* Logo */}
                    <Link href="/">
                        <img
                            src="/images/Huddle_Social_White_Background.png"
                            alt="Huddle Social Logo"
                            className="w-10 h-10 rounded-full"
                        />
                    </Link>
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
                {/* Right side => Filters button */}
                <div>
                    <Button variant="outline" onClick={() => setShowFilters(true)}>
                        ⚙️ Filters
                    </Button>
                </div>
            </nav>

            <div className="py-12 container mx-auto px-6 lg:px-12">
                <div className="text-left mb-6">
                    <h3 className="text-4xl font-bold text-gray-800">Housing</h3>
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => {
                        const urls = imageURLs[listing.id] || [];
                        return (
                            <div
                                key={listing.id}
                                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                                onClick={() => setSelectedListing(listing)}
                            >
                                <div className="relative">
                                    {/* Top Left Label (Sublet or Available) */}
                                    <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    {listing.sublettingTrue ? "Sublet" : "Available"}
                  </span>

                                    {/* Image Carousel */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        {/* Using the default height of 12.5rem for grid tiles */}
                                        <ImageCarousel images={urls} />
                                    </div>
                                </div>

                                {/* Housing Name */}
                                <h5 className="mt-4 text-lg font-semibold text-gray-800">
                                    {listing.myHousingName}
                                </h5>

                                {/* Address & Gender in One Row */}
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">{listing.placeName}</p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                                            listing.genderType === "Male"
                                                ? "bg-blue-500"
                                                : listing.genderType === "Female"
                                                    ? "bg-pink-500"
                                                    : "bg-purple-500"
                                        }`}
                                    >
                    {listing.genderType || "Co-ed"}
                  </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Sheet Modal (Selected Listing) */}
                {selectedListing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
                        <div className="bg-white w-full max-w-3xl rounded-t-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedListing(null)}
                                className="absolute top-4 right-4 text-gray-700 text-xl"
                            >
                                &times;
                            </button>

                            {/* Image Carousel in the modal */}
                            {(() => {
                                const selectedURLs = imageURLs[selectedListing.id] || [];
                                const hasImages = selectedURLs.length > 0;
                                return hasImages ? (
                                    // Here we pass a larger height (20rem) for the modal view
                                    <ImageCarousel images={selectedURLs} imageClassName="h-[20rem]" />
                                ) : (
                                    <div className="w-full h-[20rem] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                );
                            })()}

                            {/* Housing Name */}
                            <h2 className="text-3xl font-semibold mt-6 text-gray-800">
                                {selectedListing.myHousingName}
                            </h2>

                            {/* Price & Utilities/Amenities */}
                            <p className="text-xl font-semibold text-gray-700 mt-2">
                                ${selectedListing.myPrice} per person
                            </p>

                            {/* Separator */}
                            <hr className="my-4 border-gray-300" />

                            {/* Other Information */}
                            <p className="text-lg font-semibold text-gray-500 uppercase">
                                Other Information
                            </p>
                            <div className="bg-gray-100 p-4 rounded-lg mt-2">
                                {selectedListing.descriptionText || "No description provided"}
                            </div>

                            {/* Separator */}
                            <hr className="my-4 border-gray-300" />

                            {/* What's Included */}
                            <p className="text-lg font-semibold text-gray-500 uppercase">
                                What's Included
                            </p>
                            <p className="text-gray-800 mt-2">
                                {selectedListing.includesUtilities || selectedListing.includesAmenities
                                    ? `${selectedListing.includesUtilities ? "Utilities Included" : ""} ${
                                        selectedListing.includesUtilities &&
                                        selectedListing.includesAmenities
                                            ? "|"
                                            : ""
                                    } ${selectedListing.includesAmenities ? "Amenities Included" : ""}`
                                    : "No utilities or amenities specified"}
                            </p>

                            {/* Separator */}
                            <hr className="my-4 border-gray-300" />

                            {/* Contact */}
                            <p className="text-lg font-semibold text-gray-500 uppercase">
                                Contact
                            </p>
                            <p className="text-gray-800 mt-2">
                                <strong>Posted by:</strong> {posterName}
                            </p>

                            {/* Move-in/out Dates */}
                            <div className="bg-gray-100 p-4 rounded-lg mt-2">
                                <p>
                                    <strong>Move-in Date:</strong>{" "}
                                    {selectedListing.moveInDate
                                        .toDate()
                                        .toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                </p>
                                <p className="mt-2">
                                    <strong>Move-out Date:</strong>{" "}
                                    {selectedListing.moveOutDate
                                        .toDate()
                                        .toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                </p>
                            </div>

                            {/* Get Email Button */}
                            <button
                                onClick={() => alert(`Email: ${posterEmail}`)}
                                className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4"
                            >
                                Get Email
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom Sheet Modal (Filters) */}
                {showFilters && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
                        <div className="bg-white w-full max-w-md rounded-t-2xl p-6 relative">
                            {/* Cancel Button (top-right) */}
                            <button
                                onClick={handleCancel}
                                className="absolute top-4 right-4 text-gray-700 text-xl"
                            >
                                &times;
                            </button>

                            <h2 className="text-xl font-semibold mb-4">Filter Options</h2>

                            {/* Price Slider */}
                            <label className="block text-sm text-gray-600 mb-1">
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

                            {/* Beds */}
                            <label className="block text-sm text-gray-600 mb-1">
                                Beds: <strong>{filterBeds}</strong>
                            </label>
                            <select
                                className="w-full mb-4 border border-gray-300 rounded-md p-2 focus:outline-none"
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

                            {/* Baths */}
                            <label className="block text-sm text-gray-600 mb-1">
                                Baths: <strong>{filterBaths}</strong>
                            </label>
                            <select
                                className="w-full mb-6 border border-gray-300 rounded-md p-2 focus:outline-none"
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

                            {/* Buttons Row */}
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleClear}>
                                    Clear
                                </Button>
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button variant="default" onClick={handleApply}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
