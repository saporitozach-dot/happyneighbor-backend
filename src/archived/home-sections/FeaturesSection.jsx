import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🏘️",
    title: "HOA-powered hubs",
    desc: "Your association subscribes once—every verified household gets a private block hub with events, chat, and local perks.",
  },
  {
    icon: "🎉",
    title: "Plan parties in minutes",
    desc: "Block parties, cookouts, and holiday gatherings with RSVPs, crowdfunding, and a shared calendar for the whole street.",
  },
  {
    icon: "🍕",
    title: "Local food, fast",
    desc: "Order from partner pizzerias, caterers, and bakeries right inside your event—delivered to the block, not a random address.",
  },
  {
    icon: "🤝",
    title: "Neighbors who show up",
    desc: "Task board, marketplace, and local helpers so borrowing a ladder or finding a sitter happens on your block first.",
  },
];

const FeatureCard = ({ icon, title, desc, isVisible, index }) => (
  <div
    className={`glass-card-hover p-6 lg:p-7 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`}
    style={{ transition: "opacity 0.5s ease, transform 0.5s ease", transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
  >
    <div className="icon-badge mb-5">{icon}</div>
    <h3 className="font-display font-semibold text-lg text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const FeaturesSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.12 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="pt-10 pb-20 lg:pt-14 lg:pb-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-light pointer-events-none" />
      <div className="page-container relative">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="section-label">Why BlockParty</p>
          <h2 className="section-title mb-4">Everything your block needs in one place</h2>
          <p className="text-slate-600">
            Not another social feed—a private hub for real neighborhoods, starting with HOAs that want stronger community without the chaos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} isVisible={visible} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/how-it-works" className="btn-party-outline">See how HOAs get started</Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
