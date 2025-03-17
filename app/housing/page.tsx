"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";

export default function Housing() {
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [posterName, setPosterName] = useState("");
    const [posterEmail, setPosterEmail] = useState("");

    useEffect(() => {
        const fetchListings = async () => {
            const querySnapshot = await getDocs(collection(db, "Purdue University - Housing"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setListings(data);
            setFilteredListings(data);
        };
        fetchListings();
    }, []);

    // Fetch user details when modal opens
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (selectedListing?.userId) {
                const userRef = doc(db, "Users", selectedListing.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setPosterName(userSnap.data().name || "Unknown User");
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

    return (
        <section id="housing" className="bg-white py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-left mb-6">
                    <h3 className="text-4xl font-bold text-gray-800">Housing</h3>
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredListings.map((listing) => (
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

                                {/* Image */}
                                {listing.imagePaths && listing.imagePaths.length > 0 && listing.imagePaths[0].trim() ? (
                                    <img src={listing.imagePaths[0]} alt="Housing" className="w-full h-40 object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {/* Housing Name */}
                            <h5 className="mt-4 text-lg font-semibold text-gray-800">{listing.myHousingName}</h5>

                            {/* Address & Gender in One Row */}
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">{listing.placeName}</p>
                                <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                                    listing.genderType === "Male" ? "bg-blue-500" :
                                        listing.genderType === "Female" ? "bg-pink-500" :
                                            "bg-purple-500"
                                }`}>
                                    {listing.genderType || "Co-ed"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Sheet Modal */}
                {selectedListing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
                        <div className="bg-white w-full max-w-3xl rounded-t-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedListing(null)}
                                className="absolute top-4 right-4 text-gray-700 text-xl">&times;</button>

                            {/* Image */}
                            {selectedListing.imagePaths && selectedListing.imagePaths.length > 0 && selectedListing.imagePaths[0].trim() ? (
                                <img src={selectedListing.imagePaths[0]} alt="Housing" className="w-full h-64 object-cover rounded-lg" />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                    No Image Available
                                </div>
                            )}

                            {/* Housing Name */}
                            <h2 className="text-3xl font-semibold mt-6 text-gray-800">{selectedListing.myHousingName}</h2>

                            {/* Price & Utilities/Amenities */}
                            <p className="text-xl font-semibold text-gray-700 mt-2">
                                ${selectedListing.myPrice} per person
                            </p>

                            {/* Separator Line */}
                            <hr className="my-4 border-gray-300"/>

                            {/* Other Information */}
                            <p className="text-lg font-semibold text-gray-500 uppercase">Other Information</p>
                            <div className="bg-gray-100 p-4 rounded-lg mt-2">{selectedListing.descriptionText || "No description provided"}</div>

                            {/* Separator Line */}
                            <hr className="my-4 border-gray-300"/>

                            {/* What's Included */}
                            <p className="text-lg font-semibold text-gray-500 uppercase">What's Included</p>
                            <p className="text-gray-800 mt-2">
                                {selectedListing.includesUtilities || selectedListing.includesAmenities
                                    ? `${selectedListing.includesUtilities ? "Utilities Included" : ""} ${selectedListing.includesAmenities ? "| Amenities Included" : ""}`
                                    : "No utilities or amenities specified"}
                            </p>

                            {/* Separator Line */}
                            <hr className="my-4 border-gray-300"/>

                            {/* Contact Section */}
                            <p className="text-lg font-semibold text-gray-500 uppercase">Contact</p>
                            <p className="text-gray-800 mt-2"><strong>Posted by:</strong> {posterName}</p>

                            {/* Move-in and Move-out Dates */}
                            <div className="bg-gray-100 p-4 rounded-lg mt-2">
                                <p><strong>Move-in Date:</strong> {selectedListing.moveInDate.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                                <p className="mt-2"><strong>Move-out Date:</strong> {selectedListing.moveOutDate.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
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
            </div>
        </section>
    );
}
