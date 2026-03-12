import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const STATS = [
  {
    stat: "1 in 3",
    label: "Americans have never met their neighbors",
    source: "The Cut / American Home Shield",
    icon: "🏠",
  },
  {
    stat: "59%",
    label: "have never socialized with their neighbors",
    source: "American Home Shield",
    icon: "☕",
  },
  {
    stat: "50%+",
    label: "of U.S. teens report 4+ hours of daily screen time",
    source: "CDC/NCHS, 2024",
    icon: "📱",
  },
  {
    stat: "1 in 5",
    label: "Americans feel lonely “a lot of the day”",
    source: "Gallup, 2024",
    icon: "💭",
  },
  {
    stat: "70%",
    label: "would rather order sugar online than borrow from a neighbor",
    source: "American Home Shield",
    icon: "📦",
  },
  {
    stat: "46%",
    label: "of teens say parents are distracted by phones during conversations",
    source: "Pew Research, 2024",
    icon: "👨‍👩‍👧",
  },
];

const STAGGER_DELAY = 400;

const StatCard = ({ stat, label, source, icon, isVisible, index }) => {
  const delay = index * STAGGER_DELAY;
  return (
  <div
    className="relative overflow-hidden rounded-2xl bg-white/98 backdrop-blur-sm p-6 md:p-8 shadow-xl border-2 border-orange-100/80 transition-shadow duration-300 ease-out hover:shadow-2xl hover:shadow-orange-200/30 hover:border-orange-200 hover:-translate-y-1"
    style={
      isVisible
        ? { animation: `statSlideIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both` }
        : { opacity: 0, transform: 'translateY(50px)' }
    }
  >
    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/40 to-amber-100/30 rounded-bl-[120px] -translate-y-10 translate-x-10" />
    <span className="text-4xl mb-4 block drop-shadow-sm">{icon}</span>
    <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent mb-2">
      {stat}
    </div>
    <p className="text-gray-800 font-semibold mb-2">{label}</p>
    <p className="text-xs text-gray-500">{source}</p>
  </div>
  );
};

const StatsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = cardsRef.current || sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="the-problem"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-4 overflow-hidden"
    >
      {/* Lighter warm gradient - matches site orange/amber theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 via-transparent to-amber-200/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,146,60,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(245,158,11,0.2),transparent_50%)]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(180,83,9,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,83,9,0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
          }`}
        >
          <p className="text-orange-600 font-semibold uppercase tracking-widest text-sm mb-4">
            The Problem
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Technology is pulling us
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              apart at home
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Real research shows how screens and isolation have weakened the connections that make neighborhoods feel like home.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {STATS.map((item, i) => (
            <StatCard key={i} {...item} index={i} isVisible={isVisible} />
          ))}
        </div>

        <div
          className={`text-center mt-16 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
          }`}
          style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
        >
          <p className="text-gray-700 mb-6">We built Happy Neighbor to change that.</p>
          <Link
            to="/community"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Join Your Community
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
