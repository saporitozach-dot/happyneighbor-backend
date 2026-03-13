import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { API_URL } from "../utils/apiConfig";

const Businesses = () => {
  const [activeTab, setActiveTab] = useState("shops"); // "shops" or "realtors"
  const [submitting, setSubmitting] = useState(false);
  const [showBusinessLogin, setShowBusinessLogin] = useState(false);
  const [showRealtorLogin, setShowRealtorLogin] = useState(false);
  const [businessLogin, setBusinessLogin] = useState({ email: "", password: "" });
  const [realtorLogin, setRealtorLogin] = useState({ email: "", password: "" });
  const [businessLoginError, setBusinessLoginError] = useState("");
  const [realtorLoginError, setRealtorLoginError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Shop form state
  const [shopForm, setShopForm] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    business_type: "",
    city: "",
    state: "",
    menu: [], // Array of menu items
    target_cities: "",
    createLogin: false,
    loginPassword: "",
    loginPasswordConfirm: "",
  });

  // Realtor form state
  const [realtorForm, setRealtorForm] = useState({
    realtor_name: "",
    agency_name: "",
    email: "",
    phone: "",
    license_number: "",
    target_areas: "",
    target_cities: "",
    description: "",
    website: "",
    createLogin: false,
    loginPassword: "",
    loginPasswordConfirm: "",
  });

  const handleShopChange = (field, value) => {
    setShopForm({ ...shopForm, [field]: value });
  };

  const addMenuItem = () => {
    setShopForm({
      ...shopForm,
      menu: [...shopForm.menu, { name: "", price: "", serves: "", photo: null, discount: "" }]
    });
  };

  const removeMenuItem = (index) => {
    setShopForm({
      ...shopForm,
      menu: shopForm.menu.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index, field, value) => {
    const updatedMenu = [...shopForm.menu];
    updatedMenu[index] = { ...updatedMenu[index], [field]: value };
    setShopForm({ ...shopForm, menu: updatedMenu });
  };

  const handleMenuPhotoChange = (index, file) => {
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMenuItem(index, "photo", {
          file: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRealtorChange = (field, value) => {
    setRealtorForm({ ...realtorForm, [field]: value });
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    
    // Validate menu items
    if (shopForm.menu.length === 0) {
      setSubmitError("Please add at least one menu item");
      return;
    }
    
    if (shopForm.menu.some(item => !item.name || !item.price)) {
      setSubmitError("Please fill in name and price for all menu items");
      return;
    }

    if (shopForm.createLogin) {
      if (!shopForm.loginPassword || shopForm.loginPassword.length < 6) {
        setSubmitError("Password must be at least 6 characters");
        return;
      }
      if (shopForm.loginPassword !== shopForm.loginPasswordConfirm) {
        setSubmitError("Passwords do not match");
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const menuData = shopForm.menu.map(({ name, price, serves, discount }) => ({ name, price, serves, discount }));
      const res = await fetch(`${API_URL}/partnerships/shop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: shopForm.business_name,
          contact_name: shopForm.contact_name,
          email: shopForm.email,
          phone: shopForm.phone,
          business_type: shopForm.business_type,
          city: shopForm.city,
          state: shopForm.state,
          menu: menuData,
          target_cities: shopForm.target_cities,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitSuccess(true);
      setShopForm({
        business_name: "",
        contact_name: "",
        email: "",
        phone: "",
        business_type: "",
        city: "",
        state: "",
        menu: [],
        target_cities: "",
        createLogin: false,
        loginPassword: "",
        loginPasswordConfirm: "",
      });
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRealtorSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (realtorForm.createLogin) {
      if (!realtorForm.loginPassword || realtorForm.loginPassword.length < 6) {
        setSubmitError("Password must be at least 6 characters");
        return;
      }
      if (realtorForm.loginPassword !== realtorForm.loginPasswordConfirm) {
        setSubmitError("Passwords do not match");
        return;
      }
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch(`${API_URL}/partnerships/realtor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realtor_name: realtorForm.realtor_name,
          agency_name: realtorForm.agency_name,
          email: realtorForm.email,
          phone: realtorForm.phone,
          license_number: realtorForm.license_number,
          target_areas: realtorForm.target_areas,
          target_cities: realtorForm.target_cities,
          description: realtorForm.description,
          website: realtorForm.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitSuccess(true);
      setRealtorForm({
        realtor_name: "",
        agency_name: "",
        email: "",
        phone: "",
        license_number: "",
        target_areas: "",
        target_cities: "",
        description: "",
        website: "",
        createLogin: false,
        loginPassword: "",
        loginPasswordConfirm: "",
      });
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBusinessLogin = (e) => {
    e.preventDefault();
    setBusinessLoginError("Partner login is coming soon. Visit our Contact page and we'll help you access your account.");
  };

  const handleRealtorLogin = (e) => {
    e.preventDefault();
    setRealtorLoginError("Partner login is coming soon. Visit our Contact page and we'll help you access your account.");
  };

  return (
    <>
      <Helmet>
        <title>Business Partnerships - Happy Neighbor</title>
        <meta name="description" content="Partner with Happy Neighbor - Local shops and realtors can connect with neighborhoods" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
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

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Partner With Happy Neighbor</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your business with local neighborhoods. Help residents discover great local shops and find their perfect home.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-xl p-1 shadow-md">
              <button
                onClick={() => setActiveTab("shops")}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "shops"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🍕 Local Shops
              </button>
              <button
                onClick={() => setActiveTab("realtors")}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "realtors"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🏠 Realtors
              </button>
            </div>
          </div>

          {/* Local Shops Section */}
          {activeTab === "shops" && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 mb-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Local Shop Partnership</h2>
                      <p className="text-orange-100">Get featured in Community Hub event planning</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">$10</div>
                      <div className="text-orange-100 text-sm">per month</div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  When residents plan neighborhood gatherings, your shop will appear in the catered food section for the cities you serve. Simple monthly subscription - just $10/month.
                </p>
              </div>

              {submitSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-800 font-semibold">
                    ✓ Thank you! Your partnership request has been submitted. We'll review it and contact you within 1-2 business days.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-800">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleShopSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopForm.business_name}
                      onChange={(e) => handleShopChange("business_name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Tony's Pizza"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopForm.contact_name}
                      onChange={(e) => handleShopChange("contact_name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="John Smith"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={shopForm.email}
                      onChange={(e) => handleShopChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="contact@business.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={shopForm.phone}
                      onChange={(e) => handleShopChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={shopForm.business_type}
                      onChange={(e) => handleShopChange("business_type", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select type...</option>
                      <option value="pizza">Pizza</option>
                      <option value="subs">Subs & Sandwiches</option>
                      <option value="bbq">BBQ & Catering</option>
                      <option value="bakery">Bakery & Desserts</option>
                      <option value="catering">Full Catering Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopForm.city}
                      onChange={(e) => handleShopChange("city", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Boston"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopForm.state}
                      onChange={(e) => handleShopChange("state", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="MA"
                      maxLength="2"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Menu Items <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500">
                        Add your menu items with prices, serving sizes, and optional discounts to promote ordering
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addMenuItem}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Item
                    </button>
                  </div>

                  {shopForm.menu.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <p className="text-gray-500 mb-4">No menu items added yet</p>
                      <button
                        type="button"
                        onClick={addMenuItem}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Add Your First Menu Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shopForm.menu.map((item, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Menu Item #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeMenuItem(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Item Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={item.name}
                                onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                placeholder="Large Cheese Pizza"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Price <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={item.price}
                                onChange={(e) => updateMenuItem(index, "price", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                placeholder="$18.99"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Serves (Optional)
                              </label>
                              <input
                                type="text"
                                value={item.serves}
                                onChange={(e) => updateMenuItem(index, "serves", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                placeholder="8-10 people"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Discount % (Optional)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discount || ""}
                                onChange={(e) => updateMenuItem(index, "discount", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                placeholder="10"
                              />
                              <p className="text-xs text-gray-400 mt-1">Promote ordering with a discount</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Photo (Optional)
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMenuPhotoChange(index, e.target.files[0])}
                                  className="hidden"
                                  id={`menu-photo-${index}`}
                                />
                                <label
                                  htmlFor={`menu-photo-${index}`}
                                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                  {item.photo ? "Change Photo" : "Upload Photo"}
                                </label>
                                {item.photo?.preview && (
                                  <div className="relative">
                                    <img
                                      src={item.photo.preview}
                                      alt="Menu item preview"
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateMenuItem(index, "photo", null)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {shopForm.menu.length > 0 && shopForm.menu.some(item => !item.name || !item.price) && (
                    <p className="text-xs text-red-500 mt-2">
                      Please fill in all required fields (name and price) for each menu item
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Cities <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    List cities where you want to appear (comma-separated)
                  </p>
                  <input
                    type="text"
                    required
                    value={shopForm.target_cities}
                    onChange={(e) => handleShopChange("target_cities", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Boston, MA; Portland, OR"
                  />
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shopForm.createLogin}
                      onChange={(e) => handleShopChange("createLogin", e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-semibold text-gray-800">Create login to manage my business page</span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">Use your email above and create a password to log in anytime</p>
                  {shopForm.createLogin && (
                    <div className="mt-4 ml-6 grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          value={shopForm.loginPassword}
                          onChange={(e) => handleShopChange("loginPassword", e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          value={shopForm.loginPasswordConfirm}
                          onChange={(e) => handleShopChange("loginPasswordConfirm", e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || shopForm.menu.length === 0 || shopForm.menu.some(item => !item.name || !item.price)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Partnership Request ($10/month)"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Your submission will be reviewed and you'll be notified within 1-2 business days. Once approved, you'll be charged $10/month.
                </p>
              </form>
            </div>
          )}

          {/* Realtors Section */}
          {activeTab === "realtors" && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Realtor Partnership</h2>
                <p className="text-gray-600 mb-6">
                  Post your property listings in specific areas and connect with homebuyers who are actively searching for neighborhoods that match their lifestyle.
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Benefits:</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Post listings in specific streets and cities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Reach homebuyers who have already matched with those areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Showcase properties to engaged, qualified buyers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Flexible pricing based on listing volume and coverage area</span>
                    </li>
                  </ul>
                </div>
              </div>

              {submitSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-800 font-semibold">
                    ✓ Thank you! We'll contact you soon to discuss partnership details.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-800">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleRealtorSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Realtor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={realtorForm.realtor_name}
                      onChange={(e) => handleRealtorChange("realtor_name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={realtorForm.agency_name}
                      onChange={(e) => handleRealtorChange("agency_name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="ABC Realty"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={realtorForm.email}
                      onChange={(e) => handleRealtorChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="jane@abcrealty.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={realtorForm.phone}
                      onChange={(e) => handleRealtorChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Real Estate License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={realtorForm.license_number}
                    onChange={(e) => handleRealtorChange("license_number", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="RE-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Areas <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    List specific streets, neighborhoods, or areas where you have listings (comma-separated)
                  </p>
                  <input
                    type="text"
                    required
                    value={realtorForm.target_areas}
                    onChange={(e) => handleRealtorChange("target_areas", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Main Street, Oak Avenue, Downtown District"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Cities <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    List cities where you operate (comma-separated)
                  </p>
                  <input
                    type="text"
                    required
                    value={realtorForm.target_cities}
                    onChange={(e) => handleRealtorChange("target_cities", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Boston, MA; Portland, OR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={realtorForm.website}
                    onChange={(e) => handleRealtorChange("website", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Your Services <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Tell us about your real estate services and specialties
                  </p>
                  <textarea
                    required
                    value={realtorForm.description}
                    onChange={(e) => handleRealtorChange("description", e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="We specialize in helping families find homes in family-friendly neighborhoods..."
                  />
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={realtorForm.createLogin}
                      onChange={(e) => handleRealtorChange("createLogin", e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-semibold text-gray-800">Create login to manage my realtor page</span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">Use your email above and create a password to log in anytime</p>
                  {realtorForm.createLogin && (
                    <div className="mt-4 ml-6 grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          value={realtorForm.loginPassword}
                          onChange={(e) => handleRealtorChange("loginPassword", e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          value={realtorForm.loginPasswordConfirm}
                          onChange={(e) => handleRealtorChange("loginPasswordConfirm", e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Partnership Request"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We'll contact you within 2-3 business days to discuss pricing and set up your partnership.
                </p>
              </form>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-6">
            {/* Partner Logins */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <button
                  onClick={() => setShowBusinessLogin(!showBusinessLogin)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="text-orange-400">🍕</span> Business Login
                  </span>
                  <span className="text-gray-400">{showBusinessLogin ? "▼" : "▶"}</span>
                </button>
                {showBusinessLogin && (
                  <form onSubmit={handleBusinessLogin} className="mt-4 space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={businessLogin.email}
                      onChange={(e) => setBusinessLogin({ ...businessLogin, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={businessLogin.password}
                      onChange={(e) => setBusinessLogin({ ...businessLogin, password: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {businessLoginError && <p className="text-amber-300 text-xs">{businessLoginError}</p>}
                    <button type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition-colors">
                      Log In
                    </button>
                  </form>
                )}
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <button
                  onClick={() => setShowRealtorLogin(!showRealtorLogin)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="text-blue-400">🏠</span> Realtor Login
                  </span>
                  <span className="text-gray-400">{showRealtorLogin ? "▼" : "▶"}</span>
                </button>
                {showRealtorLogin && (
                  <form onSubmit={handleRealtorLogin} className="mt-4 space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={realtorLogin.email}
                      onChange={(e) => setRealtorLogin({ ...realtorLogin, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={realtorLogin.password}
                      onChange={(e) => setRealtorLogin({ ...realtorLogin, password: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {realtorLoginError && <p className="text-amber-300 text-xs">{realtorLoginError}</p>}
                    <button type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition-colors">
                      Log In
                    </button>
                  </form>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-700">
              <span className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} Happy Neighbor</span>
              <div className="flex items-center gap-6 text-xs">
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Businesses;

