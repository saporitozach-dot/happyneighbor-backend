import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-6 sm:px-10">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Happy Neighbor
              </span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            <p>We collect information that you provide directly to us, including your preferences and survey responses.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="mt-16" />
    </div>
  );
};

export default Privacy;

