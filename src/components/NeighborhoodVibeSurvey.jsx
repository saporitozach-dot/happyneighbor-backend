import React from "react";
import { NEIGHBORHOOD_VIBE_QUESTIONS } from "../data/neighborhoodVibeQuestions";

const NeighborhoodVibeSurvey = ({ values, onChange, onBack, onContinue, continueLabel = "Continue" }) => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4">
      <p className="text-sm text-slate-700 leading-relaxed">
        <strong className="text-slate-900">The neighborhood vibe check.</strong> Seven quick questions about
        how social your block feels. This helps BlockParty (and future homebuyers) understand what life is
        really like here. Not on Zillow.
      </p>
    </div>

    {NEIGHBORHOOD_VIBE_QUESTIONS.map((q) => (
      <div key={q.id}>
        <label className="block text-sm font-medium text-slate-800 mb-2">{q.label}</label>
        <div className="flex flex-wrap gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(q.id, opt)}
              className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                values[q.id] === opt
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-800 hover:border-indigo-400"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    ))}

    <div className="flex gap-3 pt-2">
      {onBack && (
        <button type="button" onClick={onBack} className="btn-party-outline px-5">
          Back
        </button>
      )}
      <button type="button" onClick={onContinue} className="flex-1 btn-party">
        {continueLabel}
      </button>
    </div>
  </div>
);

export function isVibeSurveyComplete(values) {
  return NEIGHBORHOOD_VIBE_QUESTIONS.every((q) => values[q.id]);
}

export default NeighborhoodVibeSurvey;
