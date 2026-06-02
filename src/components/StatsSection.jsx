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
    className={`glass-card p-6 hover:shadow-cardHover transition-all duration-500 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}
    style={{ transitionDelay: isVisible ? `${index * 80}ms` : "0ms" }}
  >
    <span className="text-2xl block mb-3">{icon}</span>
    <div className="text-2xl font-display font-bold gradient-text mb-1">{stat}</div>
    <p className="font-medium text-slate-800 mb-1 text-sm">{label}</p>
    <p className="text-xs text-slate-500">{source}</p>
  </div>
);

const StatsSection = ({ variant, embedded = false }) => {
  const onHome = variant === "home";
  const blockRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = blockRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const content = (
  <>
      <div className={`text-center mb-10 lg:mb-12 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <p className={`font-semibold uppercase tracking-wider text-sm mb-2 ${onHome ? "text-indigo-200" : "text-party-light"}`}>
          The problem
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
          Technology is pulling us apart at home
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
          Real research shows how screens and isolation have weakened the connections that make neighborhoods feel like home.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STATS.map((item, i) => (
          <StatCard key={i} {...item} index={i} isVisible={isVisible} />
        ))}
      </div>
      <div className={`text-center mt-10 lg:mt-12 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <p className="text-slate-300 mb-5 text-sm">We built BlockParty to change that—starting on your block.</p>
        <Link to="/community" className="btn-party">
          Find my block
        </Link>
      </div>
  </>
  );

  if (embedded && onHome) {
    return (
      <div id="discover" ref={blockRef} className="home-canvas-block scroll-mt-4">
        <div className="page-container relative">{content}</div>
      </div>
    );
  }

  return (
    <section
      id="stats"
      ref={blockRef}
      className={`py-20 lg:py-28 scroll-mt-0 relative overflow-hidden ${
        onHome ? "text-white" : "section-dark text-white"
      }`}
    >
      {!onHome && (
        <>
          <div className="liquid-blob w-80 h-80 bg-indigo-500 top-10 left-1/4" />
          <div className="liquid-blob w-64 h-64 bg-fuchsia-500 bottom-10 right-1/4" />
        </>
      )}
      <div className="relative w-full max-w-6xl mx-auto px-5 lg:px-8">{content}</div>
    </section>
  );
};

export default StatsSection;
