import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const SubmissionSuccess = () => {
  const location = useLocation();
  const { streetName, city, surveyId, pendingVerification } = location.state || {};

  return (
    <>
      <Helmet>
        <title>Thank You! - Happy Neighbor</title>
        <meta name="description" content="Thank you for sharing about your street" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Submission Complete! 🎉
            </h1>
            
            {streetName ? (
              <>
                <p className="text-lg text-gray-600 mb-2">
                  Your review of <span className="font-semibold text-green-700">{streetName}</span> has been submitted!
                </p>
                {city && (
                  <p className="text-sm text-gray-500 mb-4">{city}</p>
                )}
              </>
            ) : (
              <p className="text-lg text-gray-600 mb-4">
                Your street review has been submitted successfully.
              </p>
            )}

            {/* Pending Verification Notice */}
            {pendingVerification && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Pending Verification</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Your document is being reviewed. Once verified, your review will be visible on the street's profile.
                    </p>
                    <p className="text-xs text-amber-700 mt-2">
                      You'll receive an email notification when the review is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {surveyId && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                <p className="font-mono text-sm font-semibold text-gray-700">#{surveyId}</p>
              </div>
            )}

            {/* Community Access Teaser */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 mb-6 text-left">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-orange-900 text-lg">🔓 Unlock Your Community Hub</p>
                  <p className="text-sm text-orange-800 mt-2">
                    Once verified, you'll get exclusive access to your street's <strong>Community Hub</strong>:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-orange-700">
                    <li className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <span><strong>Event Board</strong> — Post & discover BBQs, block parties, garage sales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <span><strong>Party Fund</strong> — Pool resources for block parties & celebrations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">🤝</span>
                      <span><strong>Task Board</strong> — Need help? Ask your neighbors!</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <span><strong>Local Helpers</strong> — Hire neighbors for snow removal, lawn care, etc.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-left">
              <p className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What happens next?
              </p>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Our team reviews your verification document</li>
                <li>Once approved, your review goes live</li>
                <li>You get access to your street's Community Hub</li>
                <li>Connect with verified neighbors!</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                to="/survey"
                className="block w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Find My Perfect Neighborhood
              </Link>
              <Link
                to="/"
                className="block w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-orange-300 hover:bg-orange-50 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Social Share */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3">Know someone looking for a new neighborhood?</p>
            <div className="flex justify-center gap-4">
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110">
                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmissionSuccess;
