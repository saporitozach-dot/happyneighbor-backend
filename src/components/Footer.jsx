import React from "react";
import { Link } from "react-router-dom";

const linkGroups = [
  {
    title: "Product",
    links: [
      { to: "/how-it-works", label: "How it works" },
      { to: "/community", label: "Join your block" },
      { to: "/register-block", label: "Register your block" },
      { to: "/community/demo", label: "Demo hub" },
    ],
  },
  {
    title: "Partners",
    links: [
      { to: "/businesses", label: "Local shops" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

const Footer = ({ compact = false }) => (
  <footer
    className={`mt-auto border-t ${
      compact
        ? "border-transparent bg-transparent"
        : "border-slate-200/70 bg-white/80 backdrop-blur"
    }`}
  >
    <div className={`page-container ${compact ? "py-3" : "py-4"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-sm shrink-0">
          <img
            src="/images/logo.png"
            alt=""
            className="h-7 w-7 rounded-md object-contain"
            aria-hidden
          />
          <span>
            <span className="gradient-text">Block</span>
            <span className="text-slate-900">Party</span>
          </span>
        </Link>

        <div className="grid grid-cols-3 gap-x-4 gap-y-1 sm:gap-x-8 flex-1 sm:max-w-lg sm:ml-auto">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {group.title}
              </p>
              <nav className="flex flex-col gap-1 text-xs">
                {group.links.map(({ to, label }) => (
                  <Link key={to} to={to} className="text-slate-600 hover:text-indigo-600 transition-colors">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px] text-slate-400 ${
          compact ? "border-t border-slate-200/50 pt-2.5" : "border-t border-slate-200/70 pt-2.5"
        }`}
      >
        <span>&copy; {new Date().getFullYear()} BlockParty</span>
        <a href="mailto:hello@blockparty.app" className="hover:text-indigo-600 transition-colors">
          hello@blockparty.app
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
