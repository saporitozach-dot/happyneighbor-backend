import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ className = "" }) => {
  const linkClass = "text-gray-400 hover:text-orange-400 transition-colors duration-200";
  return (
    <footer className={`border-t border-gray-700/50 ${className}`}>
      <div className="bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-row items-center gap-3 sm:gap-4">
              <Link to="/" className="text-base font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
                Happy Neighbor
              </Link>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500 text-xs">
                © {new Date().getFullYear()} Happy Neighbor
              </span>
            </div>
            <nav className="flex flex-wrap justify-center sm:justify-end gap-6 text-sm">
              <Link to="/how-it-works" className={linkClass}>How It Works</Link>
              <Link to="/contact" className={linkClass}>Contact</Link>
              <Link to="/businesses" className={linkClass}>Businesses</Link>
              <Link to="/privacy" className={linkClass}>Privacy</Link>
              <Link to="/terms" className={linkClass}>Terms</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
