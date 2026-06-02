import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AddressAutocomplete from "../components/AddressAutocomplete";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import NeighborhoodVibeSurvey, { isVibeSurveyComplete } from "../components/NeighborhoodVibeSurvey";
import { NEIGHBORHOOD_VIBE_QUESTIONS } from "../data/neighborhoodVibeQuestions";
import { API_URL } from "../utils/apiConfig";

const emptyVibe = () =>
  Object.fromEntries(NEIGHBORHOOD_VIBE_QUESTIONS.map((q) => [q.id, ""]));

const CommunityGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialAddress = location.state?.address || "";
  const initialStreetData = location.state?.streetData || null;

  const [address, setAddress] = useState(initialAddress);
  const [returningAddress, setReturningAddress] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checkingReturning, setCheckingReturning] = useState(false);
  const [error, setError] = useState("");
  const [returningError, setReturningError] = useState("");
  const [streetData, setStreetData] = useState(initialStreetData);
  const [verificationToken, setVerificationToken] = useState("");
  const [currentStep, setCurrentStep] = useState(initialStreetData ? 2 : 1);
  const [vibeResponses, setVibeResponses] = useState(emptyVibe());
  const [residentName, setResidentName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddressVerify = async () => {
    if (!address.trim()) {
      setError("Enter your street address");
      return;
    }
    if (!/^\d+\s+\w+/.test(address.trim())) {
      setError('Valid address required (e.g., 123 Main St, City, State)');
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/lookup-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStreetData(data);
        setVerificationToken(data.verificationToken || "");
        setCurrentStep(2);
      } else {
        navigate(`/community/demo`);
      }
    } catch {
      navigate(`/community/demo`);
    } finally {
      setVerifying(false);
    }
  };

  const handleReturningCheck = async () => {
    if (!returningAddress.trim()) {
      setReturningError("Enter your address");
      return;
    }
    setCheckingReturning(true);
    setReturningError("");
    try {
      const res = await fetch(`${API_URL}/community/check-returning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: returningAddress.trim() }),
      });
      const data = await res.json();
      if (data.success && data.streetId) {
        localStorage.setItem("verifiedStreetId", data.streetId);
        localStorage.setItem("verifiedAddress", returningAddress);
        navigate(`/community/${data.streetId}`);
      } else {
        setReturningError(data.error || "Address not found. Complete the form below to join.");
      }
    } catch {
      setReturningError("Please try again or complete the form below.");
    } finally {
      setCheckingReturning(false);
    }
  };

  const handleSubmitVibe = async () => {
    if (!streetData?.street?.id) return;
    if (!isVibeSurveyComplete(vibeResponses)) {
      setError("Please answer all 7 questions.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/neighborhood-vibe-survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_id: streetData.street.id,
          address: address.trim(),
          email,
          resident_name: residentName,
          verification_token: verificationToken,
          responses: vibeResponses,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Submit failed");
      setCurrentStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnterHub = () => {
    if (streetData?.street?.id) {
      localStorage.setItem("verifiedStreetId", streetData.street.id);
      localStorage.setItem("verifiedAddress", address);
      navigate(`/community/${streetData.street.id}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Join Your Block Hub | BlockParty</title>
      </Helmet>
      <div className="min-h-screen flex flex-col site-surface">
        <Nav />
        <main className="flex-1 w-full max-w-2xl mx-auto px-5 lg:px-8 py-12">
          <div className="glass-card p-8 lg:p-10">
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Join your block hub</h1>
            <p className="text-slate-600 mb-8">
              Enter your address, then share how social your block feels. It helps neighbors and future buyers understand
              the vibe here.
            </p>

            {currentStep === 1 && (
              <div className="space-y-4">
                <AddressAutocomplete
                  value={address}
                  onChange={(v) => {
                    setAddress(v);
                    setError("");
                  }}
                  placeholder="123 Main Street, City, State"
                  disabled={verifying}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button onClick={handleAddressVerify} disabled={verifying} className="w-full btn-party disabled:opacity-60">
                  {verifying ? "Finding your street…" : "Continue"}
                </button>
              </div>
            )}

            {currentStep >= 2 && streetData && (
              <div className="space-y-6">
                <div className="border border-indigo-200/80 bg-indigo-50/50 p-4 rounded-xl">
                  <p className="font-medium text-slate-900">{streetData.street?.name}</p>
                  <p className="text-sm text-slate-600">
                    {streetData.street?.city}, {streetData.street?.state}
                  </p>
                </div>

                {currentStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name (optional)</label>
                      <input
                        type="text"
                        value={residentName}
                        onChange={(e) => setResidentName(e.target.value)}
                        placeholder="First name or nickname"
                        className="input-party"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="input-party"
                      />
                    </div>
                    <NeighborhoodVibeSurvey
                      values={vibeResponses}
                      onChange={(id, val) => setVibeResponses({ ...vibeResponses, [id]: val })}
                      onBack={() => setCurrentStep(1)}
                      onContinue={() => {
                        if (!isVibeSurveyComplete(vibeResponses)) {
                          setError("Please answer all 7 questions.");
                          return;
                        }
                        setError("");
                        setCurrentStep(3);
                      }}
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold text-slate-900">Review your answers</h2>
                    <ul className="space-y-2 text-sm border border-slate-200 rounded-xl p-4">
                      {NEIGHBORHOOD_VIBE_QUESTIONS.map((q) => (
                        <li key={q.id} className="flex justify-between gap-4">
                          <span className="text-slate-500">{q.label}</span>
                          <span className="text-slate-900 font-medium text-right">{vibeResponses[q.id]}</span>
                        </li>
                      ))}
                    </ul>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setCurrentStep(2)} className="btn-party-outline px-5">
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitVibe}
                        disabled={submitting}
                        className="flex-1 btn-party disabled:opacity-60"
                      >
                        {submitting ? "Saving…" : "Submit & continue"}
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-slate-600">
                      Thanks for sharing how your block feels. Your answers help build a picture of this neighborhood over
                      time.
                    </p>
                    <button type="button" onClick={handleEnterHub} className="w-full btn-party">
                      Enter block hub
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <h3 className="font-medium text-slate-900 mb-2">Already joined?</h3>
                <AddressAutocomplete
                  value={returningAddress}
                  onChange={setReturningAddress}
                  placeholder="Your exact address"
                  disabled={checkingReturning}
                />
                {returningError && <p className="text-sm text-amber-700 mt-2">{returningError}</p>}
                <button
                  onClick={handleReturningCheck}
                  disabled={checkingReturning}
                  className="mt-3 w-full py-2 border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 rounded-full"
                >
                  {checkingReturning ? "Checking…" : "Access my hub"}
                </button>
              </div>
            )}

            <p className="mt-8 text-center">
              <Link to="/community/demo" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                Try demo hub
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CommunityGateway;
