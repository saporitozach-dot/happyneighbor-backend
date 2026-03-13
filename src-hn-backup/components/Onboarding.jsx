import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to Happy Neighbor!",
      content: "Find streets that match your lifestyle based on verified resident reviews.",
      icon: "🏠",
    },
    {
      title: "How It Works",
      content: "Take a quick survey about your preferences, get matched with streets, and explore detailed resident insights.",
      icon: "✨",
    },
    {
      title: "Get Started",
      content: "Ready to find your perfect street match? Let's begin!",
      icon: "🚀",
    },
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/survey');
      }
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/survey');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-6xl mb-4">{steps[step - 1].icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {steps[step - 1].title}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {steps[step - 1].content}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i + 1 === step ? 'bg-orange-500 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              {step === steps.length ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;





