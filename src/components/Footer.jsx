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
      { to: "/helpers-signup", label: "List a service" },
    ],
  },
  {
    title: "Partners",
    links: [
      { to: "/businesses", label: "Local shops & realtors" },
      { to: "/contact", label: "Bring BlockParty to your block" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

const Footer = ({ compact = false }) => (
  <footer
    className={`mt-auto border-t border-slate-200/70 ${
      compact ? "border-transparent bg-transparent" : "bg-white/80 backdrop-blur"
    }`}
  >
    {!compact && <div className="h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />}
    <div className={`page-container ${compact ? "py-5" : "py-8 lg:py-10"}`}>
      <div
        className={
          compact
            ? "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
            : "grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-6"
        }
      >
        <div className={compact ? "shrink-0 max-w-[16rem]" : undefined}>
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-base">
            <img
              src="/images/logo.png"
              alt=""
              className={`rounded-lg object-contain ${compact ? "h-8 w-8" : "h-10 w-10"}`}
              aria-hidden
            />
            <span>
              <span className="gradient-text">Block</span>
              <span className="text-slate-900">Party</span>
            </span>
          </Link>
          <p className={`text-slate-500 leading-snug ${compact ? "mt-1.5 text-xs" : "mt-2 text-sm"}`}>
            The neighborhood hub for parties, local food, and real connections on every block.
          </p>
        </div>

        {compact ? (
          <div className="grid grid-cols-3 gap-4 sm:gap-8 flex-1 sm:max-w-xl sm:ml-auto">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {group.title}
                </p>
                <nav className="flex flex-col gap-1.5 text-xs">
                  {group.links.map(({ to, label }) => (
                    <Link key={to} to={to} className="text-slate-600 hover:text-indigo-600 transition-colors">
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        ) : (
          linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{group.title}</p>
              <nav className="flex flex-col gap-2 text-sm">
                {group.links.map(({ to, label }) => (
                  <Link key={to} to={to} className="text-slate-600 hover:text-indigo-600 transition-colors">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))
        )}
      </div>

      <div
        className={`flex flex-col sm:flex-row justify-between items-center gap-1.5 text-xs text-slate-400 ${
          compact ? "pt-3 border-t border-slate-200/60" : "pt-5 border-t border-slate-200/80"
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
