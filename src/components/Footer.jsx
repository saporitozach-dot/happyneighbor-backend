import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-stone-200 bg-white mt-auto">
    <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-5">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Link to="/" className="font-serif font-semibold text-stone-800">
          Happy Neighbor
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-500">
          <Link to="/businesses" className="hover:text-leaf transition-colors">Businesses</Link>
          <Link to="/contact" className="hover:text-leaf transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-leaf transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-leaf transition-colors">Terms</Link>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
