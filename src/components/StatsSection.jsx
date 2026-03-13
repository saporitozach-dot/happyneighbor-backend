import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const STATS = [
  { stat: "1 in 3", label: "Americans have never met their neighbors", source: "The Cut / American Home Shield", icon: "🏠" },
  { stat: "59%", label: "have never socialized with their neighbors", source: "American Home Shield", icon: "☕" },
  { stat: "50%+", label: "of U.S. teens report 4+ hours of daily screen time", source: "CDC/NCHS, 2024", icon: "📱" },
  { stat: "1 in 5", label: "Americans feel lonely “a lot of the day”", source: "Gallup, 2024", icon: "💭" },
  { stat: "70%", label: "would rather order sugar online than borrow from a neighbor", source: "American Home Shield", icon: "📦" },
  { stat: "46%", label: "of teens say parents are distracted by phones during conversations", source: "Pew Research, 2024", icon: "👨‍👩‍👧" },
];

const StatCard = ({ stat, label, source, icon, isVisible, index }) => (
  <div
    className={`bg-white p-6 border border-stone-100 shadow-card hover:shadow-cardHover rounded ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}
    style={{
      transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      transitionDelay: isVisible ? `${index * 500}ms` : "0ms",
    }}
  >
    <span className="text-2xl block mb-3">{icon}</span>
    <div className="text-2xl font-bold text-leaf mb-1">{stat}</div>
    <p className="font-medium text-stone-800 mb-1">{label}</p>
    <p className="text-xs text-stone-500">{source}</p>
  </div>
);

const StatsSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stats" ref={sectionRef} className="pt-16 pb-6 border-t border-stone-200 bg-stone-50/80 scroll-mt-0">
      <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16">
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <p className="text-leaf font-semibold uppercase tracking-wider text-sm mb-2">The Problem</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mb-3">
            Technology is pulling us apart at home
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
            Real research shows how screens and isolation have weakened the connections that make neighborhoods feel like home.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STATS.map((item, i) => (
            <StatCard key={i} {...item} index={i} isVisible={isVisible} />
          ))}
        </div>
        <div className={`text-center mt-10 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "300ms" }}>
          <p className="text-stone-600 mb-4 text-sm">We built Happy Neighbor to change that.</p>
          <Link to="/community" className="inline-block px-6 py-3 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors">
            Join your community
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
