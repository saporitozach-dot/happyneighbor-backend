import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://happyneighbor-api-production.up.railway.app/api';

const Survey = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    noise: "",
    sociability: "",
    events: "",
    kids: "",
    walkability: "",
    cookouts: "",
    nightlife: "",
  });

  const totalSteps = 3;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit survey and get matches
      try {
        // Save preferences to localStorage for Results page
        localStorage.setItem('userPreferences', JSON.stringify(formData));
        
        // If user is logged in, also save to their account
        if (isAuthenticated) {
          try {
            await fetch(`${API_URL}/user/preferences`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(formData),
            });
          } catch (error) {
            console.error("Error saving preferences to account:", error);
            // Continue even if saving to account fails
          }
        }
        
        navigate("/results");
      } catch (error) {
        console.error("Error submitting survey:", error);
        navigate("/results");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What's your ideal noise level?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Very Quiet", "Quiet", "Moderate", "Lively"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("noise", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.noise === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                How social do you want your neighborhood to be?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Very Private", "Somewhat Social", "Social", "Very Social"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("sociability", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.sociability === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Interest in community events?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["None", "Occasional", "Regular", "Very Active"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("events", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.events === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Kid-friendly neighborhood?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Not Important", "Somewhat", "Important", "Very Important"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("kids", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.kids === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                How walkable should it be?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Not Important", "Somewhat", "Walkable", "Very Walkable"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("walkability", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.walkability === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Interest in neighborhood cookouts/BBQs?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["None", "Occasional", "Regular", "Love Them"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("cookouts", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.cookouts === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Nightlife preference?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Quiet Evenings", "Some Activity", "Active", "Very Active"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChange("nightlife", option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.nightlife === option
                        ? "border-orange-600 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Review Your Preferences</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {Object.entries(formData).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Neighborhood Survey - Happy Neighbor</title>
        <meta name="description" content="Tell us about your ideal neighborhood preferences. We'll match you with communities that fit your lifestyle." />
        <link rel="canonical" href="https://happyneighbor.com/survey" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navigation */}
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

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tell Us About Your Ideal Neighborhood
          </h1>
          <p className="text-gray-600 mb-8">
            Help us understand your preferences so we can find your perfect match
          </p>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              {currentStep === totalSteps ? "Find My Matches" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Survey;

