import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from '../contexts/AuthContext';
import Onboarding from '../components/Onboarding';
import BudgetLocationModal from '../components/BudgetLocationModal';

import { API_URL } from "../utils/apiConfig";

const AI_MESSAGES = [
  "AI analyzing your preferences...",
  "Finding your matches...",
  "Almost there...",
];

const Survey = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [formData, setFormData] = useState({
    noise: "",
    walkability: "",
    safety: "",
    kids_friendly: "",
    public_education: "",
    events: "",
    lawn_space: "",
    neighbor_familiarity: "",
  });

  const totalSteps = 2; // 4 questions per step

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Cycle through AI messages while calculating
  useEffect(() => {
    if (!isCalculating) return;
    const interval = setInterval(() => {
      setAiMessageIndex((i) => (i + 1) % AI_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isCalculating]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show AI calculation loading screen
      setIsCalculating(true);
      try {
        // Always save to localStorage for Results page
        localStorage.setItem('userPreferences', JSON.stringify(formData));

        // If user is logged in, save to their account (primary storage)
        if (isAuthenticated) {
          try {
            const response = await fetch(`${API_URL}/user/preferences`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                noise: formData.noise,
                walkability: formData.walkability,
                safety: formData.safety,
                kids_friendly: formData.kids_friendly,
                public_education: formData.public_education,
                events: formData.events,
                lawn_space: formData.lawn_space,
                neighbor_familiarity: formData.neighbor_familiarity,
              }),
            });
            if (!response.ok) throw new Error('Failed to save preferences');
          } catch (error) {
            console.error("Error saving preferences to account:", error);
          }
        }

        // Minimum loading time so user sees the AI experience
        await new Promise((r) => setTimeout(r, 3500));
        setIsCalculating(false);
        setShowBudgetModal(true);
      } catch (error) {
        console.error("Error submitting survey:", error);
        setIsCalculating(false);
        setShowBudgetModal(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    if (currentStep === 1) {
      return formData.noise && formData.walkability && formData.safety && formData.kids_friendly;
    } else if (currentStep === 2) {
      return formData.public_education && formData.events && formData.lawn_space && formData.neighbor_familiarity;
    }
    return false;
  };

  const OptionButton = ({ field, option }) => {
    const selected = formData[field] === option;
    return (
      <button
        type="button"
        onClick={() => handleChange(field, option)}
        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          selected
            ? "bg-orange-100 text-orange-800 border border-orange-200"
            : "bg-gray-50 text-gray-600 hover:bg-orange-50/50 border border-gray-200"
        }`}
      >
        {option}
      </button>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-10 animate-fade-in">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Noise level</label>
              <p className="text-sm text-gray-500 mb-3">From quiet to vibrant</p>
              <div className="grid grid-cols-4 gap-2">
                {["Very Quiet", "Quiet", "Moderate", "Lively"].map((option) => (
                  <OptionButton key={option} field="noise" option={option} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Walkability</label>
              <p className="text-sm text-gray-500 mb-3">Can you walk to shops, parks, and cafes?</p>
              <div className="grid grid-cols-4 gap-2">
                {["Not Walkable", "Somewhat Walkable", "Walkable", "Very Walkable"].map((option) => (
                  <OptionButton key={option} field="walkability" option={option} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Safety importance</label>
              <p className="text-sm text-gray-500 mb-3">Feeling secure in your neighborhood</p>
              <div className="grid grid-cols-4 gap-2">
                {["Not Important", "Somewhat Important", "Important", "Very Important"].map((option) => (
                  <OptionButton key={option} field="safety" option={option} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Family-friendly</label>
              <p className="text-sm text-gray-500 mb-3">Kids playing outside, families nearby</p>
              <div className="grid grid-cols-4 gap-2">
                {["Not Important", "Somewhat Important", "Important", "Very Important"].map((option) => (
                  <OptionButton key={option} field="kids_friendly" option={option} />
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-10 animate-fade-in">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Public school quality</label>
              <p className="text-sm text-gray-500 mb-3">K-12 schools in the area</p>
              <div className="grid grid-cols-4 gap-2">
                {["Not Important", "Somewhat Important", "Important", "Very Important"].map((option) => (
                  <OptionButton key={option} field="public_education" option={option} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Community events</label>
              <p className="text-sm text-gray-500 mb-3">Block parties, meetups, street festivals</p>
              <div className="grid grid-cols-4 gap-2">
                {["None", "Occasional", "Regular", "Very Active"].map((option) => (
                  <OptionButton key={option} field="events" option={option} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Lawn & yard space</label>
              <p className="text-sm text-gray-500 mb-3">Outdoor space importance</p>
              <div className="grid grid-cols-4 gap-2">
                {["Not Important", "Somewhat Important", "Important", "Very Important"].map((option) => (
                  <OptionButton key={option} field="lawn_space" option={option} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Neighbor familiarity</label>
              <p className="text-sm text-gray-500 mb-3">Neighbors who know each other</p>
              <div className="grid grid-cols-4 gap-2">
                {["Not Important", "Somewhat Important", "Important", "Very Important"].map((option) => (
                  <OptionButton key={option} field="neighbor_familiarity" option={option} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Your preferences</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(formData).map(([key, value]) =>
                  value ? (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      <Helmet>
        <title>Neighborhood Survey - Happy Neighbor</title>
        <meta name="description" content="Tell us about your ideal neighborhood preferences. We'll match you with communities that fit your lifestyle." />
        <link rel="canonical" href="https://happyneighbor.com/survey" />
      </Helmet>
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {showBudgetModal && (
        <BudgetLocationModal onComplete={() => { setShowBudgetModal(false); navigate("/results"); }} />
      )}
      {isCalculating && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center max-w-sm px-8">
            <div className="relative mb-5">
              <div className="w-10 h-10 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-b-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-gray-600 text-center min-h-[1.25rem] transition-opacity duration-300">
              {AI_MESSAGES[aiMessageIndex]}
            </p>
            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-orange-50/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
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

      {/* Progress Bar */}
      <div className="bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Your ideal neighborhood
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            We&apos;ll use this to match you with streets that fit
          </p>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Back
              </button>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={handleNext}
                  disabled={!isStepComplete() || isCalculating}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isStepComplete()
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {currentStep === totalSteps ? "Find matches" : "Next"}
                </button>
                {!isStepComplete() && (
                  <p className="text-xs text-gray-400">Answer all questions to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Survey;
