import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ResidentSubmission = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [streetData, setStreetData] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState(null);
  
  // Document verification state
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [formData, setFormData] = useState({
    resident_name: "",
    noise_level: "",
    sociability: "",
    events: "",
    kids_friendly: "",
    walkability: "",
    cookouts: "",
    nightlife: "",
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
      // Validate file size (10MB max)
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
        // Success! Navigate to success page
        navigate("/submission-success", { 
          state: { 
            streetName: streetData.street.name,
            city: streetData.street.city,
            surveyId: surveyId,
            pendingVerification: true
          }
        });
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

  // Survey options
  const options = {
    noise_level: ["Very Quiet", "Quiet", "Moderate", "Lively"],
    sociability: ["Very Private", "Mostly Private", "Friendly", "Social", "Very Social"],
    events: ["None", "Occasional", "Regular", "Very Active"],
    kids_friendly: ["Not Family-Friendly", "Some Families", "Family-Friendly", "Very Family-Friendly"],
    walkability: ["Not Walkable", "Somewhat Walkable", "Walkable", "Very Walkable"],
    cookouts: ["No Cookouts", "Occasional Cookouts", "Regular Cookouts", "Very Active Cookouts"],
    nightlife: ["Quiet Evenings", "Some Activity", "Active", "Very Active"],
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where do you live?</h2>
              <p className="text-gray-600">
                Enter your address and we'll find or create your street's profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Home Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setVerificationError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressVerify()}
                placeholder="123 Main Street, Boston, MA"
                className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  verificationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={verifying}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Include house number, street name, city, and state
              </p>
            </div>

            {verificationError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{verificationError}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleAddressVerify}
              disabled={verifying || !address.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Finding your street...
                </span>
              ) : (
                "Find My Street"
              )}
            </button>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Your privacy matters</p>
                  <p className="text-xs text-amber-800 mt-1">
                    We only use your address to verify you live on this street. Your exact address is never shown publicly—only the street name.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Street confirmation banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-900">{streetData?.street?.name}</p>
                  <p className="text-sm text-green-800">{streetData?.street?.city}, {streetData?.street?.state}</p>
                  <p className="text-sm text-green-700 mt-2">{streetData?.message}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your street</h2>
              <p className="text-gray-600 mb-8">
                What's it really like living on <strong>{streetData?.street?.name}</strong>?
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                🔊 What's the noise level like?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.noise_level.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("noise_level", option)}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.noise_level === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                👋 How social are your neighbors?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {options.sociability.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("sociability", option)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.sociability === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                From "waves from a distance" to "block parties every weekend"
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                🎉 Community events & gatherings?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.events.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("events", option)}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.events === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                👨‍👩‍👧‍👦 Family-friendliness?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.kids_friendly.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("kids_friendly", option)}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.kids_friendly === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost done!</h2>
              <p className="text-gray-600">A few more details about <strong>{streetData?.street?.name}</strong></p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                🚶 How walkable is it?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.walkability.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("walkability", option)}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.walkability === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                🍖 Cookouts & BBQs?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.cookouts.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("cookouts", option)}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.cookouts === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                🌙 Nightlife & evening activity?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {options.nightlife.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange("nightlife", option)}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      formData.nightlife === option
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                📧 Your Email <span className="text-orange-500 font-normal">(required for verification updates)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">We'll notify you when your review is verified</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Your Name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.resident_name}
                onChange={(e) => handleChange("resident_name", e.target.value)}
                placeholder="John D."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Anything else? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={formData.additional_notes}
                onChange={(e) => handleChange("additional_notes", e.target.value)}
                rows="3"
                placeholder="Great neighbors, beautiful trees in fall, watch out for the speed bump..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Residency</h2>
              <p className="text-gray-600">
                Upload proof that you live on <strong>{streetData?.street?.name}</strong> to complete your review
              </p>
            </div>

            {/* Why verification */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Why we verify</p>
                  <p className="text-xs text-blue-800 mt-1">
                    Verification ensures all reviews come from real residents, making our data trustworthy and valuable for people looking for their perfect neighborhood.
                  </p>
                </div>
              </div>
            </div>

            {/* Document type selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Document Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocType(doc.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedDocType === doc.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <p className={`font-medium ${selectedDocType === doc.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {doc.label}
                        </p>
                        <p className="text-xs text-gray-500">{doc.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Upload Document
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                uploadFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
              }`}>
                <input
                  type="file"
                  id="doc-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadFile ? (
                  <div>
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-medium text-green-700">{uploadFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => setUploadFile(null)}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove & choose different file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📤</div>
                    <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG, GIF, WebP, or PDF • Max 10MB
                    </p>
                  </label>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}

            {/* Privacy note */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Your document is secure</p>
                  <p className="text-xs text-gray-600 mt-1">
                    We only use your document to verify residency. It's securely stored and never shared publicly.
                    Feel free to redact sensitive information like account numbers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      handleAddressVerify();
      return;
    }
    if (currentStep === 3) {
      // Validate email
      if (!email.trim() || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      handleSubmitSurvey();
      return;
    }
    if (currentStep === 4) {
      handleDocumentUpload();
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return address.trim().length > 0;
    if (currentStep === 2) return formData.noise_level && formData.sociability;
    if (currentStep === 3) return email.trim().includes('@');
    if (currentStep === 4) return selectedDocType && uploadFile;
    return true;
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 1: return "Find your street";
      case 2: return "Describe your street";
      case 3: return "Final details";
      case 4: return "Verify residency";
      default: return "";
    }
  };

  return (
    <>
      <Helmet>
        <title>Share Your Street - Happy Neighbor</title>
        <meta name="description" content="Share what it's like living on your street to help others find their perfect neighborhood" />
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
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {getStepLabel()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentStep === 4 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Survey Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || currentStep === 4}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentStep === 1 || currentStep === 4
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed() || verifying || submitting || uploading}
                className={`px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  currentStep === 4 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : currentStep === 3
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                }`}
              >
                {verifying ? "Verifying..." : 
                 submitting ? "Saving..." : 
                 uploading ? "Uploading..." :
                 currentStep === 3 ? "Save & Continue to Verification" :
                 currentStep === 4 ? "Submit Verification" :
                 "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResidentSubmission;
