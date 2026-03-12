import React, { useState } from "react";
import { Link } from "react-router-dom";

const FirstResidentCelebration = ({ streetName, streetId, onEnter }) => {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== "undefined" ? (streetId ? `${window.location.origin}/community/${streetId}` : `${window.location.origin}/community`) : "";
  const shareText = `I just started our Community Hub for ${streetName || "our street"} on Happy Neighbor! Join me to connect with neighbors, plan events, and share resources. 🏘️`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${streetName} on Happy Neighbor`,
          text: shareText,
          url: inviteUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-y-auto">
      <div className="max-w-lg w-full py-12">
        {/* Confetti-style decoration */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 shadow-xl mb-6 animate-pulse">
            <span className="text-5xl">🌟</span>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-3xl">🎉</span>
            <span className="text-3xl">🏠</span>
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            You're the First!
          </h1>
          <p className="text-xl text-orange-700 font-semibold mb-2">
            You just started the Community Hub for {streetName || "your street"}
          </p>
          <p className="text-gray-600 text-lg">
            You're a neighborhood pioneer. The more neighbors who join, the more useful your hub becomes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-orange-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📣</span> Spread the word
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Share with neighbors so they can join your hub. More residents = more events, more help, and a stronger community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShare}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {copied ? "✓ Link copied!" : "Share with neighbors"}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Copy link
            </button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            You can always invite neighbors later from the hub
          </p>
          <button
            onClick={onEnter}
            className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Enter Community Hub →
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstResidentCelebration;
