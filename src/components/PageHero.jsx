import React from "react";

const PageHero = ({ label, title, subtitle, children }) => (
  <section className="page-hero relative py-16 lg:py-20 overflow-hidden">
    <div className="liquid-blob w-64 h-64 bg-violet-500 -top-10 -right-10 opacity-30" />
    <div className="liquid-blob w-48 h-48 bg-cyan-400 bottom-0 left-10 opacity-25" />
    <div className="page-container relative text-center max-w-3xl z-10">
      {label && (
        <p className="hero-label font-semibold uppercase tracking-[0.15em] text-xs mb-3">{label}</p>
      )}
      <h1 className="hero-title font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
        {title}
      </h1>
      {subtitle && <p className="hero-subtitle text-lg leading-relaxed">{subtitle}</p>}
      {children}
    </div>
  </section>
);

export default PageHero;
