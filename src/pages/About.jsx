import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const founders = [
  { name: "Zach Saporito", role: "Co-Founder", image: "/images/zach-saporito.jpg", linkedin: "https://www.linkedin.com/in/zachsaporito/" },
  { name: "Charlie Fischer", role: "Co-Founder", image: "/images/charlie-fischer.jpg", linkedin: "https://www.linkedin.com/in/charlie-fischer1/" },
];

const About = () => {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>About Us | Happy Neighbor</title>
        <meta name="description" content="Meet the founders of Happy Neighbor and learn about our mission to restore real human connection." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-warm-50">
        <Nav />
        <main className="flex-1 w-full max-w-3xl mx-auto px-6 lg:px-12 py-16 text-center">
          {/* Founders */}
          <section className="mb-16">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 mb-3">Meet the Founders</h1>
            <p className="text-stone-600 text-lg mb-12 max-w-xl mx-auto">
              We want to bring back neighborhoods, one household at a time.
            </p>
            <div className="grid md:grid-cols-2 gap-12 max-w-lg mx-auto justify-items-center">
              {founders.map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-36 h-36 rounded-full object-cover mb-4 shadow-lg ring-2 ring-stone-100"
                  />
                  <h3 className="text-xl font-medium text-stone-900">{f.name}</h3>
                  <p className="text-accent text-sm mb-2 font-medium">{f.role}</p>
                  <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700 text-sm transition-colors">
                    LinkedIn →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Mission */}
          <section className="mb-16">
            <div className="bg-white border border-stone-200 p-8 md:p-10 mx-auto text-center">
              <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-4">Our Mission</p>
              <p className="text-lg text-stone-800 leading-relaxed max-w-2xl mx-auto">
                Happy Neighbor&apos;s mission is to <span className="text-stone-900 font-medium">bring back neighborhoods</span> by restoring real human connection, strengthening local economies, and redefining how people choose where to live. We help families find <span className="text-stone-900 font-medium">communities, not just houses</span>, and create places where people are proud to live.
              </p>
            </div>
          </section>

          {/* Our Story */}
          <section className="mb-16 mx-auto max-w-2xl">
            <button
              onClick={() => setStoryOpen(!storyOpen)}
              className="w-full flex items-center justify-center gap-3 p-5 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <h2 className="text-xl font-semibold text-stone-900">Our Story</h2>
              <span className={`text-stone-500 transition-transform ${storyOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {storyOpen && (
              <div className="bg-white border border-t-0 border-stone-200 p-6 space-y-4 text-stone-700 leading-relaxed text-left">
                <p>Zach and Charlie met in college in 2025. Like most students adjusting to a new chapter, they found themselves observing the world with fresh eyes. What they saw troubled them.</p>
                <p>Everywhere they looked, people were glued to their phones. In dining halls, dorm rooms, and common spaces, screens had replaced conversations. Neighbors walked past each other without a wave. Communities that once thrived on front-porch conversations had become silent rows of closed doors.</p>
                <p className="text-stone-900 font-medium">They realized people use technology most when at home, exactly where community should be strongest.</p>
                <p>So they built Happy Neighbor: a platform designed not to keep you on your screen, but to get you off it. Technology that brings people back outside, back to their front porches, and back to the interactions that make a neighborhood feel like home.</p>
                <p>Today, Happy Neighbor is committed to returning locals to small businesses by dedicating time to partner with local shops and support neighborhood gatherings. We believe that strong communities are built not just through neighbor-to-neighbor connections, but by fostering relationships between residents and the local businesses that serve them, creating a vibrant ecosystem where everyone thrives together.</p>
              </div>
            )}
          </section>

          {/* CTA */}
          <section className="pb-4">
            <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">Ready to connect with your neighborhood?</h2>
            <p className="text-stone-600 mb-6">Enter your address and join your street&apos;s community hub.</p>
            <Link
              to="/community"
              className="inline-block px-8 py-3 bg-leaf text-stone-900 font-medium hover:bg-leaf-dark transition-colors rounded no-underline"
            >
              Join Your Hub
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;
