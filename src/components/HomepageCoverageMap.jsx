import React from "react";
import USMap from "./USMap";

// Curated list of real places using Happy Neighbor (demo data - spread across US)
const DEMO_LOCATIONS = [
  { id: 1, name: "Frenchtown", location: "St. Charles, MO" },
  { id: 2, name: "New Town", location: "St. Charles, MO" },
  { id: 3, name: "Old Town St. Charles", location: "St. Charles, MO" },
  { id: 4, name: "Kirkwood Heights", location: "Kirkwood, MO" },
  { id: 5, name: "Clayton Heights", location: "Clayton, MO" },
  { id: 6, name: "Chesterfield Valley", location: "Chesterfield, MO" },
  { id: 7, name: "Lake Oswego", location: "Portland, OR" },
  { id: 8, name: "Beaverton", location: "Portland, OR" },
  { id: 9, name: "West Linn", location: "Portland, OR" },
  { id: 10, name: "Bellevue", location: "Seattle, WA" },
  { id: 11, name: "Kirkland", location: "Seattle, WA" },
  { id: 12, name: "Sammamish", location: "Seattle, WA" },
  { id: 13, name: "Round Rock", location: "Austin, TX" },
  { id: 14, name: "Cedar Park", location: "Austin, TX" },
  { id: 15, name: "Back Bay", location: "Boston, MA" },
  { id: 16, name: "Brookline Village", location: "Boston, MA" },
  { id: 17, name: "Newton Centre", location: "Boston, MA" },
  { id: 18, name: "Lincoln Park", location: "Chicago, IL" },
  { id: 19, name: "Evanston", location: "Chicago, IL" },
  { id: 20, name: "Santa Monica", location: "Los Angeles, CA" },
  { id: 21, name: "Pasadena", location: "Los Angeles, CA" },
  { id: 22, name: "Capitol Hill", location: "Seattle, WA" },
  { id: 23, name: "Denver Highlands", location: "Denver, CO" },
  { id: 24, name: "Boulder", location: "Denver, CO" },
  { id: 25, name: "Nashville", location: "Nashville, TN" },
  { id: 26, name: "Virginia Highland", location: "Atlanta, GA" },
  { id: 27, name: "Decatur", location: "Atlanta, GA" },
];

const HomepageCoverageMap = () => {
  return (
    <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-white via-orange-50/20 to-orange-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Communities Using Happy Neighbor
          </h2>
          <p className="text-gray-600 text-lg">
            <span className="font-bold text-orange-500">{DEMO_LOCATIONS.length}+</span> neighborhoods and growing
          </p>
        </div>
        <div className="rounded-2xl shadow-2xl border-2 border-orange-100 overflow-hidden ring-4 ring-orange-100/50" style={{ aspectRatio: '1100/650' }}>
          <USMap
            neighborhoods={DEMO_LOCATIONS}
            markerColor="#F97316"
            markerSelectedColor="#EA580C"
            interactive={false}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Orange dots show where neighbors are connecting
        </p>
      </div>
    </section>
  );
};

export default HomepageCoverageMap;
