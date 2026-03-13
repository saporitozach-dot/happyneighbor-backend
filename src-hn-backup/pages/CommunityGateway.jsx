import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AddressAutocomplete from "../components/AddressAutocomplete";

import { API_URL } from "../utils/apiConfig";

const CommunityGateway = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("new"); // "new" or "returning"
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [streetData, setStreetData] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState(null);
  
  // Returning neighbor state
  const [returningAddress, setReturningAddress] = useState('');
  const [returningError, setReturningError] = useState('');
  const [checkingReturning, setCheckingReturning] = useState(false);
  
  // Document verification state
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
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

  const totalSteps = 4;

  const documentTypes = [
    { id: 'mail', label: 'Piece of Mail', icon: '📬', description: 'Letter or package showing your name and address' },
    { id: 'utility_bill', label: 'Utility Bill', icon: '💡', description: 'Electric, gas, water, or internet bill' },
    { id: 'lease', label: 'Lease Agreement', icon: '📋', description: 'Rental agreement or lease document' },
    { id: 'photo_id', label: 'Photo ID', icon: '🪪', description: 'Driver\'s license or state ID with address' },
    { id: 'mortgage_statement', label: 'Mortgage Statement', icon: '🏠', description: 'Mortgage or property tax document' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddressVerify = async () => {
    if (!address.trim()) {
      setVerificationError("Please enter your complete street address");
      return;
    }

    const addressPattern = /^\d+\s+\w+/;
    if (!addressPattern.test(address.trim())) {
      setVerificationError('Please enter a valid address starting with a house number (e.g., "123 Main Street, Boston, MA")');
      return;
    }

    setVerifying(true);
    setVerificationError('');
    setStreetData(null);

    try {
      const response = await fetch(`${API_URL}/lookup-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setStreetData(data);
        setVerificationToken(data.verificationToken);
        setVerificationError('');
        setCurrentStep(2);
      } else {
        setVerificationError(data.error || 'Could not verify address. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError('Unable to verify address. Please check your connection and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitSurvey = async () => {
    if (!streetData?.street?.id) {
      alert("Please verify your address first");
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/streets/${streetData.street.id}/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          address: address,
          email: email,
          verification_token: verificationToken,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSurveyId(result.surveyId);
        setCurrentStep(4); // Go to document verification step
      } else {
        throw new Error(result.error || "Failed to submit");
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Error submitting survey: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File too large. Maximum size is 10MB.');
        return;
      }
      setUploadFile(file);
      setUploadError('');
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedDocType) {
      setUploadError('Please select a document type');
      return;
    }
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document', uploadFile);
      formDataUpload.append('verification_type', selectedDocType);

      const response = await fetch(`${API_URL}/surveys/${surveyId}/verify`, {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store street ID and navigate to community hub
        const sid = streetData.street.id;
        localStorage.setItem('verifiedStreetId', sid);
        localStorage.setItem('verifiedAddress', address);
        const verifiedStreets = JSON.parse(localStorage.getItem('verifiedStreets') || '[]');
        if (!verifiedStreets.includes(sid)) {
          verifiedStreets.push(sid);
          localStorage.setItem('verifiedStreets', JSON.stringify(verifiedStreets));
        }
        navigate(`/community/${sid}`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle returning neighbor address check
  const handleReturningCheck = async () => {
    if (!returningAddress.trim()) {
      setReturningError("Please enter your exact address");
      return;
    }

    const addressPattern = /^\d+\s+\w+/;
    if (!addressPattern.test(returningAddress.trim())) {
      setReturningError('Please enter your full address (e.g., "123 Main Street, Boston, MA")');
      return;
    }

    setCheckingReturning(true);
    setReturningError('');

    try {
      // Check if this address is already verified
      const response = await fetch(`${API_URL}/community/check-returning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: returningAddress.trim() })
      });

      const data = await response.json();

      if (data.success && data.streetId) {
        // Address found and verified - go to community hub
        localStorage.setItem('verifiedStreetId', data.streetId);
        localStorage.setItem('verifiedAddress', returningAddress);
        navigate(`/community/${data.streetId}`);
      } else {
        setReturningError(data.error || "We couldn't find your address in our system. Please complete the survey below to join your community hub.");
      }
    } catch (error) {
      console.error('Returning check error:', error);
      setReturningError('Unable to verify. Please try again or complete the survey below.');
    } finally {
      setCheckingReturning(false);
    }
  };

  // Survey options - MUST match ResidentSubmission.jsx and Survey.jsx for proper matching
  // These values are used to describe the ACTUAL characteristics of the street
  const options = {
    noise_level: ["Very Quiet", "Quiet", "Moderate", "Lively"],
    walkability: ["Not Walkable", "Somewhat Walkable", "Walkable", "Very Walkable"],
    safety: ["Not Safe", "Somewhat Safe", "Safe", "Very Safe"],
    kids_friendly: ["Not Family-Friendly", "Some Families", "Family-Friendly", "Very Family-Friendly"],
    public_education: ["Poor", "Below Average", "Average", "Good", "Excellent"],
    events: ["None", "Occasional", "Regular", "Very Active"],
    lawn_space: ["Small Yards", "Moderate Yards", "Large Yards", "Very Large Yards"],
    neighbor_familiarity: ["Never", "Rarely", "Sometimes", "Often"],
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 mb-4">
                <span className="text-3xl">🏘️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Join Your Community Hub</h2>
              <p className="text-gray-600 mt-2">Enter your address to get started</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Street Address</label>
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                placeholder="123 Main Street, City, State"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                disabled={verifying}
              />
              <p className="text-sm text-gray-500 mt-2">Start typing your address and select from suggestions</p>
            </div>

            {verificationError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{verificationError}</p>
              </div>
            )}

            <button
              onClick={handleAddressVerify}
              disabled={verifying}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Your Street...
                </span>
              ) : (
                "Find My Street"
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tell Us About {streetData?.street?.name}</h2>
              <p className="text-gray-600 mt-2">Your insights help neighbors find their perfect fit</p>
            </div>

            {streetData && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-green-800">{streetData.street.name}</p>
                    <p className="text-sm text-green-700">{streetData.street.city}, {streetData.street.state}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name (Optional)</label>
                <input
                  type="text"
                  value={formData.resident_name}
                  onChange={(e) => handleChange("resident_name", e.target.value)}
                  placeholder="First name or nickname"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">We'll send your Community Hub access here</p>
              </div>

              {/* Survey Questions */}
              {Object.entries(options).map(([key, values]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {key === "noise_level" && "🔊 What's the noise level like?"}
                    {key === "walkability" && "🚶 How walkable is your street?"}
                    {key === "safety" && "🛡️ How safe does your street feel?"}
                    {key === "kids_friendly" && "👨‍👩‍👧‍👦 Family-friendliness?"}
                    {key === "public_education" && "🎓 How are the public schools in the area?"}
                    {key === "events" && "🎉 Community events & gatherings?"}
                    {key === "lawn_space" && "🌱 What's the lawn space & yard size like?"}
                    {key === "neighbor_familiarity" && "👋 Do neighbors know each other by name?"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleChange(key, value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData[key] === value
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anything else to share? (Optional)</label>
                <textarea
                  value={formData.additional_notes}
                  onChange={(e) => handleChange("additional_notes", e.target.value)}
                  rows={3}
                  placeholder="Best things about your street, tips for new neighbors..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
              <p className="text-gray-600 mt-2">Make sure everything looks good</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Street</p>
                <p className="font-semibold text-gray-900">{streetData?.street?.name}</p>
                <p className="text-sm text-gray-600">{streetData?.street?.city}, {streetData?.street?.state}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-2">Your Ratings</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(formData).filter(([k, v]) => v && k !== 'resident_name' && k !== 'additional_notes').map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmitSurvey}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit & Continue"}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Almost There!</h2>
              <p className="text-gray-600 mt-2">Verify your address to unlock your Community Hub</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Why verify?</strong> This ensures only real neighbors can access your community hub, keeping it safe and trustworthy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Document Type</label>
              <div className="grid gap-3">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocType(doc.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedDocType === doc.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <span className="text-2xl">{doc.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{doc.label}</p>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDocType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-orange-500 cursor-pointer"
                />
                {uploadFile && (
                  <p className="text-sm text-green-600 mt-2">✓ {uploadFile.name}</p>
                )}
              </div>
            )}

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{uploadError}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleDocumentUpload}
                disabled={uploading || !selectedDocType || !uploadFile}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Verify & Enter Community Hub"}
              </button>
            </div>

            <button
              onClick={() => {
                // Skip verification for now - go to demo mode
                navigate(`/community/demo`);
              }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 underline"
            >
              Skip verification for now (limited access)
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Community Hub | Happy Neighbor</title>
        <meta name="description" content="Join your neighborhood's Community Hub. Connect with neighbors, share events, and build a stronger community." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="px-6 sm:px-10">
            <div className="flex justify-between items-center h-14">
              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">Happy Neighbor</span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link to="/survey" className="text-gray-600 hover:text-orange-600 transition-colors font-semibold tracking-wide">
                  Find Your Match
                </Link>
                <Link to="/survey" className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold tracking-wide hover:shadow-lg transition-all hover:scale-105">
                  Find Streets
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Community Hub</h1>
            <p className="text-xl text-orange-100">Connect with your neighbors, share events, and build community</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {currentStep > step ? "✓" : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 rounded ${currentStep > step ? "bg-orange-500" : "bg-gray-200"}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Survey Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            {renderStepContent()}
          </div>

          {/* Returning Neighbor Section */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-300">
              <div className="text-center mb-6">
                <span className="text-4xl mb-4 block">👋</span>
                <h3 className="text-xl font-bold text-gray-900">Returning Neighbor?</h3>
                <p className="text-gray-600 mt-2">Already submitted your street info? Enter your exact address to access your Community Hub.</p>
              </div>

              <div className="space-y-4">
                <AddressAutocomplete
                  value={returningAddress}
                  onChange={setReturningAddress}
                  placeholder="Enter your exact address (e.g., 123 Main St, Boston, MA)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={checkingReturning}
                />

                {returningError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-700 text-sm">{returningError}</p>
                  </div>
                )}

                <button
                  onClick={handleReturningCheck}
                  disabled={checkingReturning}
                  className="w-full px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50"
                >
                  {checkingReturning ? "Checking..." : "Access My Community Hub"}
                </button>
              </div>
            </div>
          )}

          {/* Demo Mode Link */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm mb-2">Just want to explore?</p>
            <Link 
              to="/community/demo" 
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              Try the Demo Community Hub →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityGateway;


