"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Housing() {
    const [listings, setListings] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [price, setPrice] = useState(2500);
    const [beds, setBeds] = useState(0);
    const [baths, setBaths] = useState(0);
    const [filteredListings, setFilteredListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            const querySnapshot = await getDocs(collection(db, "Purdue University - Housing"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setListings(data);
            setFilteredListings(data);
        };
        fetchListings();
    }, []);

    const applyFilters = () => {
        setFilteredListings(listings.filter(listing =>
            Number(listing.myPrice) <= price &&
            (beds === 0 || Number(listing.bedsCount) === beds) &&
            (baths === 0 || Number(listing.bathsCount) === baths)
        ));
        setShowFilters(false);
    };

    return (
        <section id="housing" className="bg-white py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-left mb-6">
                    <h3 className="text-4xl font-bold text-gray-800">Housing</h3>
                </div>
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="border border-gray-300 px-4 py-2 rounded-full flex items-center space-x-2 shadow-md">
                        <i className="bi bi-filter"></i>
                        <span>Filters</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                        <div className="bg-white w-full max-w-lg rounded-xl p-6 relative overflow-auto max-h-[90vh]">
                            <button
                                onClick={() => setShowFilters(false)}
                                className="absolute top-4 right-4 text-gray-700 text-xl">&times;</button>
                            <h3 className="text-lg font-bold mb-4">All Filters</h3>
                            <div className="mb-4">
                                <label className="block font-semibold">Price: ${price}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold">Beds</label>
                                <select
                                    className="w-full border rounded-lg p-2 mt-1"
                                    value={beds}
                                    onChange={(e) => setBeds(Number(e.target.value))}
                                >
                                    <option value="0">Any</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold">Baths</label>
                                <select
                                    className="w-full border rounded-lg p-2 mt-1"
                                    value={baths}
                                    onChange={(e) => setBaths(Number(e.target.value))}
                                >
                                    <option value="0">Any</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                            <button
                                onClick={applyFilters}
                                className="w-full bg-green-500 text-white py-2 rounded-lg mt-4">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="bg-white shadow-md rounded-lg p-4">
                            <div className="relative">
                                <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">{listing.sublettingTrue ? "Sublet" : "Available"}</span>
                                {listing.imagePaths && listing.imagePaths.length > 0 && listing.imagePaths[0].trim() ? (
                                    <img
                                        src={listing.imagePaths[0]}
                                        alt="Housing"
                                        className="w-full h-40 object-cover rounded-lg"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <h5 className="text-lg font-semibold text-gray-800">{listing.myHousingName}</h5>
                                <p className="text-sm text-gray-600">{listing.placeName}</p>
                                <p className="text-sm font-semibold text-gray-800">{listing.bedsCount} bed, {listing.bathsCount} bath | ${listing.myPrice} per person</p>
                                <p className="text-sm text-green-500">{listing.descriptionText}</p>
                                <p className="text-sm text-gray-600">Amenities: {listing.allAmenities?.join(", ") || "N/A"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
