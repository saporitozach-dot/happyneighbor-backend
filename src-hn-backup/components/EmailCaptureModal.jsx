import React, { useState } from "react";
import { API_URL } from "../utils/apiConfig";

const EmailCaptureModal = ({ onComplete, onSkip, title, subtitle, submitLabel = "Continue", skipLabel = "Skip", source = "signup", streetIds = [] }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source, streetIds }),
      });
      if (!res.ok) throw new Error("Failed to save");
      localStorage.setItem("capturedEmail", email.trim().toLowerCase());
      onComplete(email.trim());
    } catch (err) {
      // Store locally if API fails (demo mode)
      localStorage.setItem("capturedEmail", email.trim().toLowerCase());
      onComplete(email.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-orange-100 text-sm mt-1">{subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800"
              autoFocus
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex gap-3">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 px-4 py-3 text-gray-600 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {skipLabel}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-70 transition-all"
            >
              {loading ? "..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailCaptureModal;
