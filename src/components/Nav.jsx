import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/register-block", label: "Register block" },
  { to: "/about", label: "About" },
  { to: "/businesses", label: "Partners" },
];

const Nav = ({ overlay = false }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHero = overlay;

  return (
    <nav
      className={
        onHero
          ? "home-hero-nav glass-nav-hero"
          : "sticky top-0 z-50 glass-nav"
      }
    >
      <div className="w-full max-w-6xl mx-auto px-5 lg:px-8">
        <div className="flex justify-between items-center h-[4.25rem]">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/images/logo.png" alt="" className="h-12 w-12 rounded-xl object-contain" aria-hidden />
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="gradient-text">Block</span>
              <span className={onHero ? "text-white" : "text-slate-900"}>Party</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? onHero
                      ? "bg-white/20 text-white"
                      : "bg-party-pale text-party-dark"
                    : onHero
                      ? "text-white/85 hover:text-white hover:bg-white/10"
                      : "text-slate-600 hover:text-party-dark hover:bg-party-pale/60"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link to="/community" className="ml-2 btn-party text-sm py-2.5 px-5">Find my block</Link>
          </div>

          <button
            type="button"
            className={`md:hidden p-2 rounded-lg ${onHero ? "text-white" : "text-slate-700"}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium ${
                  onHero ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-party-pale"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link to="/community" onClick={() => setOpen(false)} className="btn-party text-center mt-2">Find my block</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
