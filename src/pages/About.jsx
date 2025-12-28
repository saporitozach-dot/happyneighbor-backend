import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Happy Neighbor
              </span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Happy Neighbor</h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              Happy Neighbor was born from a simple idea: finding the right home isn't just about the house—it's about finding a community that matches your lifestyle and values.
            </p>
            <p>
              We combine local data, resident feedback, and lifestyle indicators to help you discover neighborhoods where you'll truly feel at home.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p>
              To help people find neighborhoods where they can thrive, connect, and feel truly at home. We believe everyone deserves to live in a community that fits their lifestyle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

