import React from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "../components/AnimatedSection";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-6 sm:px-10">
          <div className="grid grid-cols-3 items-center h-14 w-full">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Happy Neighbor
              </span>
            </Link>
            <div className="hidden md:flex items-center justify-center gap-8">
              <Link to="/survey" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Find Your Match</Link>
              <Link to="/community" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Community</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">About</Link>
            </div>
            <div className="hidden md:flex justify-end items-center col-start-3 row-start-1">
              <span className="text-sm text-gray-500 italic">Change for the Good</span>
            </div>
            <Link to="/" className="md:hidden text-sm text-gray-600 hover:text-gray-900 col-start-3 row-start-1 justify-self-end">Home</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimatedSection>
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-8">
            Have questions? We'd love to hear from you!
          </p>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea rows="6" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"></textarea>
            </div>
            <button className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              Send Message
            </button>
          </form>
        </div>
        </AnimatedSection>
      </div>

      <Footer className="mt-16" />
    </div>
  );
};

export default Contact;

