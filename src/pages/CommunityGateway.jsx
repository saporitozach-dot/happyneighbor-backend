import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AddressAutocomplete from "../components/AddressAutocomplete";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { API_URL } from "../utils/apiConfig";

const CommunityGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialAddress = location.state?.address || "";
  const initialStreetData = location.state?.streetData || null;

  const [mode, setMode] = useState("new");
  const [address, setAddress] = useState(initialAddress);
  const [returningAddress, setReturningAddress] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checkingReturning, setCheckingReturning] = useState(false);
  const [error, setError] = useState("");
  const [returningError, setReturningError] = useState("");
  const [streetData, setStreetData] = useState(initialStreetData);
  const [verificationToken, setVerificationToken] = useState("");
  const [currentStep, setCurrentStep] = useState(initialStreetData ? 2 : 1);
  const [formData, setFormData] = useState({
    resident_name: "",
    noise_level: "",
    walkability: "",
    safety: "",
    kids_friendly: "",
    public_education: "",
    events: "",
    lawn_space: "",
    neighbor_familiarity: "",
    additional_notes: "",
  });
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState(null);

  const options = {
    noise_level: ["Very Quiet", "Quiet", "Moderate", "Lively"],
    walkability: ["Not Walkable", "Somewhat", "Walkable", "Very Walkable"],
    safety: ["Not Safe", "Somewhat Safe", "Safe", "Very Safe"],
    kids_friendly: ["Not Family-Friendly", "Some Families", "Family-Friendly", "Very Family-Friendly"],
    public_education: ["Poor", "Below Average", "Average", "Good", "Excellent"],
    events: ["None", "Occasional", "Regular", "Very Active"],
    lawn_space: ["Small Yards", "Moderate", "Large Yards", "Very Large"],
    neighbor_familiarity: ["Never", "Rarely", "Sometimes", "Often"],
  };

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
        // Prototype bypass: API error → go to demo
        navigate(`/community/demo`);
      }
    } catch (err) {
      // Prototype bypass: API unreachable → go to demo
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

  const handleSubmitSurvey = async () => {
    if (!streetData?.street?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/streets/${streetData.street.id}/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          address,
          email,
          verification_token: verificationToken,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSurveyId(result.surveyId);
        setCurrentStep(4);
      } else {
        throw new Error(result.error || "Submit failed");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipVerification = () => {
    if (streetData?.street?.id) {
      localStorage.setItem("verifiedStreetId", streetData.street.id);
      localStorage.setItem("verifiedAddress", address);
      navigate(`/community/${streetData.street.id}`);
    }
  };

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <>
      <Helmet>
        <title>Join Your Community Hub | Happy Neighbor</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-warm-50">
        <Nav />
        <main className="flex-1 w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-12">
          <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-2">Join your community hub</h1>
          <p className="text-stone-600 mb-8">Enter your address to find or start your street&apos;s hub.</p>

          {currentStep === 1 && (
            <div className="space-y-4">
              <AddressAutocomplete
                value={address}
                onChange={(v) => { setAddress(v); setError(""); }}
                placeholder="123 Main Street, City, State"
                disabled={verifying}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleAddressVerify}
                disabled={verifying}
                className="w-full py-3 bg-leaf text-white font-medium hover:bg-leaf-dark disabled:opacity-60 transition-colors"
              >
                {verifying ? "Finding your street…" : "Continue"}
              </button>
            </div>
          )}

          {currentStep >= 2 && streetData && (
            <div className="space-y-6">
              <div className="border border-leaf/30 bg-leaf-pale/60 p-4">
                <p className="font-medium text-stone-900">{streetData.street?.name}</p>
                <p className="text-sm text-stone-600">{streetData.street?.city}, {streetData.street?.state}</p>
              </div>

              {currentStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Name (optional)</label>
                    <input
                      type="text"
                      value={formData.resident_name}
                      onChange={(e) => handleChange("resident_name", e.target.value)}
                      placeholder="First name or nickname"
                      className="w-full px-4 py-2 border border-stone-300 bg-white text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-stone-300 bg-white text-stone-800"
                    />
                  </div>
                  {Object.entries(options).map(([key, values]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-stone-700 mb-2">{key.replace(/_/g, " ")}</label>
                      <div className="flex flex-wrap gap-2">
                        {values.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleChange(key, v)}
                            className={`px-3 py-1.5 text-sm border transition-colors ${
                              formData[key] === v
                                ? "border-leaf bg-leaf text-white"
                                : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Notes (optional)</label>
                    <textarea
                      value={formData.additional_notes}
                      onChange={(e) => handleChange("additional_notes", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-stone-300 bg-white text-stone-800"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-2 bg-leaf text-white font-medium"
                    >
                      Review
                    </button>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="border border-stone-200 p-4 space-y-2 text-sm">
                    {Object.entries(formData).filter(([k, v]) => v && !["resident_name", "additional_notes"].includes(k)).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-stone-500">{k.replace(/_/g, " ")}</span>
                        <span className="text-stone-900">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setCurrentStep(2)} className="px-4 py-2 border border-stone-300 text-stone-700">
                      Back
                    </button>
                    <button
                      onClick={handleSubmitSurvey}
                      disabled={submitting}
                      className="flex-1 py-2 bg-leaf text-white font-medium disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </button>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-stone-600">
                    Thanks for contributing! For full hub access, verify your address (coming soon). Until then, you can explore in demo mode.
                  </p>
                  <button
                    onClick={handleSkipVerification}
                    className="w-full py-3 bg-leaf text-white font-medium"
                  >
                    Enter Community Hub
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="mt-10 pt-8 border-t border-stone-200">
              <h3 className="font-medium text-stone-900 mb-2">Already joined?</h3>
              <p className="text-sm text-stone-500 mb-3">Enter your address to access your hub.</p>
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
                className="mt-3 w-full py-2 border border-stone-300 text-stone-700 font-medium hover:bg-stone-50"
              >
                {checkingReturning ? "Checking…" : "Access my hub"}
              </button>
            </div>
          )}

          <p className="mt-8 text-center">
            <Link to="/community/demo" className="text-sm text-stone-500 hover:text-leaf transition-colors">
              Try demo hub
            </Link>
          </p>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CommunityGateway;
