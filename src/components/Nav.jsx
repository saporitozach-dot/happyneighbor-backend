import React from "react";
import { Link } from "react-router-dom";

const Nav = () => (
  <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100">
    <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16">
      <div className="flex justify-between items-center h-14">
        <Link
          to="/"
          className="font-serif font-semibold text-stone-900 hover:text-leaf transition-colors"
        >
          Happy Neighbor
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/about"
            className="text-stone-600 hover:text-leaf transition-colors"
          >
            About
          </Link>
          <Link
            to="/community"
            className="px-4 py-2 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

export default Nav;
