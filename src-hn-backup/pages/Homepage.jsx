import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../contexts/AuthContext";
import { StructuredData } from "../components/StructuredData";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";

const Homepage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Helmet>
        <title>Happy Neighbor - Find Your Perfect Street Match</title>
        <meta name="description" content="Match with streets that fit your lifestyle. Get transparent street vibes from verified residents." />
      </Helmet>
      <StructuredData />
      
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="px-6 sm:px-10">
            <div className="grid grid-cols-3 items-center h-14 w-full">
              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight hidden sm:inline">
                  Happy Neighbor
                </span>
              </Link>
              <div className="hidden md:flex items-center justify-center gap-8">
                <Link to="/survey" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-semibold tracking-wide">Find Your Match</Link>
                <Link to="/community" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-semibold tracking-wide">Community Hub</Link>
                <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-semibold tracking-wide">About</Link>
              </div>
              <div className="hidden md:flex justify-end items-center gap-4">
                {isAuthenticated ? (
                  <Link to="/profile" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    Profile
                  </Link>
                ) : (
                  <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-orange-600 font-semibold transition-colors">
                    Sign In
                  </Link>
                )}
                <span className="text-sm text-gray-500 italic">Change for the Good</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Full Viewport */}
        <section className="relative h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="/images/hero-neighborhood.png" alt="Happy Neighbor" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Find a Street That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Feels Like Home</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-xl mx-auto">
              Match with streets based on verified resident reviews
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/survey" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Take the Survey
              </Link>
              <Link to="/about" className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all">
                Learn More
              </Link>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <a
            href="#the-problem"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:text-white transition-colors"
            aria-label="Scroll to learn more"
          >
            <svg className="w-6 h-6 text-white/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </section>

        {/* Stats Section */}
        <StatsSection />

        <Footer />
      </div>
    </>
  );
};

export default Homepage;
