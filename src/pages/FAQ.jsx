import React from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      question: "How does Happy Neighbor work?",
      answer: "You complete a short survey about your lifestyle preferences, and we match you with neighborhoods that fit your criteria.",
    },
    {
      question: "Is it free to use?",
      answer: "Yes! Happy Neighbor is completely free to use.",
    },
    {
      question: "How accurate are the matches?",
      answer: "Our algorithm combines local data, resident feedback, and lifestyle indicators to provide accurate neighborhood matches.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Happy Neighbor
              </span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{faq.question}</h2>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

