import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../contexts/AuthContext";
import { useInView } from "../hooks/useInView";
import HomepageCoverageMap from "../components/HomepageCoverageMap";
import Footer from "../components/Footer";

const About = () => {
  const { isAuthenticated } = useAuth();
  const [storyOpen, setStoryOpen] = useState(false);
  const [foundersRef, foundersInView] = useInView();
  const [missionRef, missionInView] = useInView();
  const [storyRef, storyInView] = useInView();
  const [ctaRef, ctaInView] = useInView();
  const [mapRef, mapInView] = useInView({ threshold: 0.2 });

  const founders = [
    {
      name: "Zach Saporito",
      role: "Co-Founder",
      image: "/images/public/images/zach-saporito.jpg",
      linkedin: "https://www.linkedin.com/in/zachsaporito/",
    },
    {
      name: "Charlie Fischer",
      role: "Co-Founder",
      image: "/images/public/images/charlie-fischer.jpg",
      linkedin: "https://www.linkedin.com/in/charlie-fischer1/",
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Happy Neighbor</title>
        <meta name="description" content="Meet the founders of Happy Neighbor and learn about our mission to restore real human connection." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-orange-100/50">
          <div className="px-6 sm:px-10">
            <div className="grid grid-cols-3 items-center h-14 w-full">
              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">Happy Neighbor</span>
              </Link>
              <div className="hidden md:flex items-center justify-center gap-8">
                <Link to="/survey" className="text-gray-600 hover:text-orange-600 transition-colors text-sm font-medium">Find Your Match</Link>
                <Link to="/community" className="text-gray-600 hover:text-orange-600 transition-colors text-sm font-medium">Community</Link>
                <Link to="/about" className="text-orange-600 font-semibold text-sm">About</Link>
              </div>
              <div className="hidden md:flex justify-end items-center gap-4 col-start-3 row-start-1">
                {isAuthenticated ? (
                  <Link to="/profile" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all hover:shadow-lg text-sm">Profile</Link>
                ) : (
                  <Link to="/login" className="text-gray-600 hover:text-orange-600 font-semibold text-sm transition-colors">Sign In</Link>
                )}
                <span className="text-sm text-gray-500 italic">Change for the Good</span>
              </div>
              <Link to="/" className="md:hidden text-sm text-gray-600 hover:text-gray-900 col-start-3 row-start-1 justify-self-end">Home</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-6 py-16">
          
          {/* Founders - scroll animation */}
          <section
            ref={foundersRef}
            className={`text-center mb-16 transition-all duration-700 ease-out ${
              foundersInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
            }`}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Meet the Founders
            </h1>
            <p className="text-gray-600 text-lg mb-12 max-w-xl mx-auto">
              We want to bring back neighborhoods, one household at a time.
            </p>

            <div className="grid md:grid-cols-2 gap-12 max-w-lg mx-auto">
              {founders.map((founder, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center transition-all duration-700 ease-out ${
                    foundersInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
                  }`}
                  style={{ transitionDelay: foundersInView ? `${index * 120}ms` : "0ms" }}
                >
                  <div className="relative group">
                    <img 
                      src={founder.image} 
                      alt={founder.name}
                      className="w-36 h-36 rounded-full object-cover mb-4 shadow-xl ring-4 ring-white transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{founder.name}</h3>
                  <p className="text-orange-600 text-sm mb-3 font-medium">{founder.role}</p>
                  <a 
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#0077B5] text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Mission Statement - scroll animation */}
          <section
            ref={missionRef}
            className={`mb-16 transition-all duration-700 ease-out ${
              missionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 relative overflow-hidden border border-orange-100/50 hover:shadow-xl transition-shadow duration-300">
              <svg className="absolute top-4 left-4 w-12 h-12 text-orange-200 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <svg className="absolute bottom-4 right-4 w-12 h-12 text-orange-200 opacity-60 rotate-180" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              
              <p className="text-orange-600 text-sm font-semibold uppercase tracking-wider mb-4 relative z-10">Our Mission</p>
              <p className="text-xl text-gray-800 leading-relaxed relative z-10">
                Happy Neighbor&apos;s mission is to <span className="text-orange-600 font-semibold">bring back neighborhoods</span> by restoring real human connection, strengthening local economies, and redefining how people choose where to live. We help families find <span className="text-orange-600 font-semibold">communities, not just houses</span>, and create places where people are proud to live.
              </p>
            </div>
          </section>

          {/* Our Story - scroll animation */}
          <section
            ref={storyRef}
            className={`mb-16 transition-all duration-700 ease-out ${
              storyInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
            }`}
          >
            <button 
              onClick={() => setStoryOpen(!storyOpen)}
              className="w-full flex items-center justify-between p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100/50"
            >
              <h2 className="text-xl font-bold text-gray-900">Our Story</h2>
              <svg 
                className={`w-5 h-5 text-orange-500 transition-transform duration-300 ${storyOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                storyOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="bg-white rounded-xl p-6 shadow-md border border-t-0 border-orange-100/50 space-y-4 text-gray-700 leading-relaxed">
                <p>Zach and Charlie met in college in 2025. Like most students adjusting to a new chapter, they found themselves observing the world with fresh eyes. What they saw troubled them.</p>
                <p>Everywhere they looked, people were glued to their phones. In dining halls, dorm rooms, and common spaces, screens had replaced conversations. Neighbors walked past each other without a wave. Communities that once thrived on front-porch conversations had become silent rows of closed doors.</p>
                <p className="text-gray-900 font-semibold">They realized people use technology most when at home, exactly where community should be strongest.</p>
                <p>So they built Happy Neighbor: a platform designed not to keep you on your screen, but to get you off it. Technology that brings people back outside, back to their front porches, and back to the interactions that make a neighborhood feel like home.</p>
                <p>Today, Happy Neighbor is committed to returning locals to small businesses by dedicating time to partner with local shops and support neighborhood gatherings. We believe that strong communities are built not just through neighbor-to-neighbor connections, but by fostering relationships between residents and the local businesses that serve them, creating a vibrant ecosystem where everyone thrives together.</p>
              </div>
            </div>
          </section>

          {/* CTA - scroll animation */}
          <section
            ref={ctaRef}
            className={`text-center mb-6 transition-all duration-700 ease-out ${
              ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
            }`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ready to find your community?</h2>
            <p className="text-gray-600 mb-6">Take our survey and discover streets where you belong.</p>
            <Link 
              to="/survey" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Take the Survey
            </Link>
          </section>
        </main>

        {/* Coverage Map - scroll animation */}
        <section
          ref={mapRef}
          className={`pt-4 pb-12 px-4 sm:px-6 transition-all duration-700 ease-out ${
            mapInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
          }`}
        >
          <HomepageCoverageMap />
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
