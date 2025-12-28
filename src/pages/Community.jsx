import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const Community = () => {
  const { streetId } = useParams();
  const [activeTab, setActiveTab] = useState("events");
  const [street, setStreet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCrowdfundModal, setShowCrowdfundModal] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showContactModal, setShowContactModal] = useState(null);

  // Form states
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", description: "", type: "party" });
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "other", urgency: "low" });
  const [newCrowdfund, setNewCrowdfund] = useState({ title: "", goal: "", description: "", deadline: "" });
  const [newHelper, setNewHelper] = useState({ title: "", price: "", description: "", availability: "" });

  // Data states
  const [events, setEvents] = useState([
    { id: 1, title: "Summer Block Party 🎉", date: "2024-07-15", time: "4:00 PM", houseNumber: "247", description: "Annual summer cookout! Bring a dish to share. We'll have games for kids, a bounce house, and live music from a local band. BYOB but we'll have lemonade and water for everyone!", attendees: 12, type: "party", going: false },
    { id: 2, title: "Neighborhood Garage Sale", date: "2024-06-22", time: "8:00 AM", houseNumber: "Multiple", description: "Multi-family garage sale spanning 8 houses. Maps available at corner of Oak & Main. Rain date: June 29th.", attendees: 8, type: "sale", going: false },
    { id: 3, title: "Kids Bike Parade 🚲", date: "2024-07-04", time: "10:00 AM", houseNumber: "189", description: "Decorate your bikes and join us for a patriotic parade down the block! We'll end at the park for popsicles. All ages welcome!", attendees: 15, type: "activity", going: false },
  ]);

  const [crowdfunds, setCrowdfunds] = useState([
    { id: 1, title: "Holiday Block Party Supplies", goal: 300, raised: 185, backers: 9, houseNumber: "312", description: "Tents, decorations, hot cocoa station for our annual holiday gathering! Any leftover funds go to next year.", deadline: "2024-12-01", status: "active" },
    { id: 2, title: "Summer BBQ Cookout Fund", goal: 200, raised: 200, backers: 12, houseNumber: "156", description: "Burgers, dogs, sides, and drinks for the July 4th block party. Thanks everyone!", deadline: "2024-06-28", status: "funded" },
    { id: 3, title: "Back-to-School Ice Cream Social", goal: 150, raised: 75, backers: 5, houseNumber: "423", description: "Welcome families back with an ice cream truck visit! Kids eat free, adults $2 suggested.", deadline: "2024-08-15", status: "active" },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Help setting up new computer", category: "tech", houseNumber: "267", urgency: "low", description: "Need help transferring files from old laptop and setting up email on new one. Happy to provide snacks and coffee!", offers: 2 },
    { id: 2, title: "Quick lawn mow needed", category: "yard", houseNumber: "134", urgency: "medium", description: "Going on vacation Saturday morning, need someone to mow lawn once while we're gone (back July 20). Will pay!", offers: 1 },
    { id: 3, title: "Pet sitting (2 cats) July 10-15", category: "pets", houseNumber: "389", urgency: "low", description: "Feed twice daily, scoop litter, give some love. Happy to return the favor anytime! Keys provided.", offers: 3 },
  ]);

  const [localHelpers, setLocalHelpers] = useState([
    { id: 1, title: "Snow Removal", houseNumber: "156", price: "$20/driveway", description: "Will shovel your driveway and walkway after snowfall. Salt included! Usually done by 8am.", availability: "Winter season", rating: 4.8, reviews: 12 },
    { id: 2, title: "Lawn Mowing", houseNumber: "423", price: "$25/mow", description: "Weekly or one-time mowing. I have my own equipment. Edging included.", availability: "Spring-Fall", rating: 5.0, reviews: 8 },
    { id: 3, title: "Dog Walking", houseNumber: "267", price: "$15/walk", description: "30-minute walks, flexible scheduling. Love all dogs! Can do multiple dogs from same household.", availability: "Year-round", rating: 4.9, reviews: 15 },
    { id: 4, title: "Tech Support", houseNumber: "312", price: "$30/hour", description: "Computer setup, WiFi issues, phone help, smart home devices. Patient with all skill levels!", availability: "Evenings & weekends", rating: 5.0, reviews: 6 },
  ]);

  const isDemo = streetId === "demo";

  useEffect(() => {
    fetchStreetData();
    checkVerification();
  }, [streetId]);

  const fetchStreetData = async () => {
    // Demo mode - use sample street data
    if (isDemo) {
      setStreet({ name: "Maple Street", city: "Springfield", state: "IL" });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/streets/${streetId}/vibe`);
      if (response.ok) {
        const data = await response.json();
        setStreet(data.street);
      }
    } catch (error) {
      console.error("Error fetching street:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {
    // Demo mode - check if demo was verified
    if (isDemo && localStorage.getItem("demoVerified") === "true") {
      setIsVerified(true);
      return;
    }
    
    const verifiedStreets = JSON.parse(localStorage.getItem("verifiedStreets") || "[]");
    if (verifiedStreets.includes(parseInt(streetId))) {
      setIsVerified(true);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setVerifyError("Please enter your verification code");
      return;
    }

    // Demo mode - accept DEMO code directly
    if (isDemo && verificationCode.toUpperCase() === "DEMO") {
      setIsVerified(true);
      localStorage.setItem("demoVerified", "true");
      setVerifyError("");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/community/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streetId, code: verificationCode })
      });

      const data = await response.json();
      
      if (data.verified) {
        setIsVerified(true);
        const verifiedStreets = JSON.parse(localStorage.getItem("verifiedStreets") || "[]");
        verifiedStreets.push(parseInt(streetId));
        localStorage.setItem("verifiedStreets", JSON.stringify(verifiedStreets));
        setVerifyError("");
      } else {
        setVerifyError(data.error || "Invalid verification code");
      }
    } catch (error) {
      setVerifyError("Verification failed. Please try again.");
    }
  };

  // Event handlers
  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert("Please fill in title, date, and time");
      return;
    }
    const event = {
      id: Date.now(),
      ...newEvent,
      houseNumber: "Your House",
      attendees: 1,
      going: true
    };
    setEvents([event, ...events]);
    setNewEvent({ title: "", date: "", time: "", description: "", type: "party" });
    setShowEventModal(false);
  };

  const handleGoingToggle = (eventId) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          going: !e.going,
          attendees: e.going ? e.attendees - 1 : e.attendees + 1
        };
      }
      return e;
    }));
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description) {
      alert("Please fill in title and description");
      return;
    }
    const task = {
      id: Date.now(),
      ...newTask,
      houseNumber: "Your House",
      offers: 0
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: "", description: "", category: "other", urgency: "low" });
    setShowTaskModal(false);
  };

  const handleOfferHelp = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, offers: t.offers + 1 };
      }
      return t;
    }));
    alert("Thanks for offering to help! Walk over to their house to coordinate. 🏠");
  };

  const handleCreateCrowdfund = () => {
    if (!newCrowdfund.title || !newCrowdfund.goal || !newCrowdfund.deadline) {
      alert("Please fill in title, goal, and deadline");
      return;
    }
    const fund = {
      id: Date.now(),
      ...newCrowdfund,
      goal: parseInt(newCrowdfund.goal),
      raised: 0,
      backers: 0,
      houseNumber: "Your House",
      status: "active"
    };
    setCrowdfunds([fund, ...crowdfunds]);
    setNewCrowdfund({ title: "", goal: "", description: "", deadline: "" });
    setShowCrowdfundModal(false);
  };

  const handleChipIn = (fundId, amount) => {
    setCrowdfunds(crowdfunds.map(f => {
      if (f.id === fundId) {
        const newRaised = f.raised + amount;
        return {
          ...f,
          raised: newRaised,
          backers: f.backers + 1,
          status: newRaised >= f.goal ? "funded" : "active"
        };
      }
      return f;
    }));
    alert(`Thanks for chipping in $${amount}! 🎉`);
  };

  const handleCreateHelper = () => {
    if (!newHelper.title || !newHelper.price || !newHelper.description) {
      alert("Please fill in service name, price, and description");
      return;
    }
    const helper = {
      id: Date.now(),
      ...newHelper,
      houseNumber: "Your House",
      rating: 5.0,
      reviews: 0
    };
    setLocalHelpers([helper, ...localHelpers]);
    setNewHelper({ title: "", price: "", description: "", availability: "" });
    setShowHelperModal(false);
  };

  const getCategoryIcon = (category) => {
    const icons = { tech: "💻", yard: "🌿", pets: "🐾", moving: "📦", errands: "🏃", other: "✨" };
    return icons[category] || "✨";
  };

  const getEventIcon = (type) => {
    const icons = { party: "🎉", sale: "🏷️", activity: "🎯", meeting: "📋", other: "📅" };
    return icons[type] || "📅";
  };

  const getServiceIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("lawn") || lower.includes("yard")) return "🌿";
    if (lower.includes("dog") || lower.includes("pet")) return "🐕";
    if (lower.includes("tech") || lower.includes("computer")) return "💻";
    return "🔧";
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Verification Gate
  if (!isVerified) {
    return (
      <>
        <Helmet>
          <title>Community Hub - Verification Required | Happy Neighbor</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
          <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Happy Neighbor
                </Link>
                <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Home</Link>
              </div>
            </div>
          </nav>

          <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">Community Hub Access</h1>
                <p className="text-gray-600 mb-6">
                  {isDemo 
                    ? "This is a demo of the Community Hub. Enter the code below to explore!"
                    : <>Exclusively for verified residents of <span className="font-semibold text-orange-600">{street?.name || "this street"}</span>.</>
                  }
                </p>

                {isDemo ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-green-800">🎉 Demo Mode</p>
                    <p className="text-sm text-green-700 mt-2">
                      Type <span className="font-mono font-bold bg-green-100 px-2 py-0.5 rounded">DEMO</span> below to explore the Community Hub features!
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-orange-800">How to get access:</p>
                    <ol className="text-sm text-orange-700 mt-2 space-y-1 list-decimal list-inside">
                      <li>Submit a street review with address verification</li>
                      <li>Once approved, receive your code via email</li>
                      <li>Enter the code below to unlock</li>
                    </ol>
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder={isDemo ? "Type DEMO" : "Enter verification code"}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg tracking-wider"
                  />
                  {verifyError && <p className="text-red-600 text-sm">{verifyError}</p>}
                  <button onClick={handleVerify} className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    {isDemo ? "Explore Demo" : "Unlock Community Hub"}
                  </button>
                  {!isDemo && (
                    <p className="text-xs text-gray-500">
                      Don't have a code? <Link to="/submit" className="text-orange-600 hover:underline">Submit your street review</Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main Community Hub
  return (
    <>
      <Helmet>
        <title>{street?.name} Community Hub | Happy Neighbor</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Happy Neighbor
              </Link>
              <div className="flex items-center gap-4">
                {!isDemo && <Link to={`/street/${streetId}`} className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Street Profile</Link>}
                <Link to="/submit" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Share Your Street</Link>
                <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Home</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header - Improved Readability */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 backdrop-blur rounded-full text-sm font-medium text-white ${isDemo ? "bg-green-500/30" : "bg-white/20"}`}>
                {isDemo ? "🎉 Demo Mode" : "✓ Verified Resident"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm mb-1">{street?.name} Community Hub</h1>
            <p className="text-orange-100">{street?.city}, {street?.state}</p>
            <p className="text-white/80 text-sm mt-3 flex items-center gap-2 bg-black/10 rounded-lg px-3 py-2 w-fit">
              <span>🏠</span>
              <span>Posts show house numbers only — walk over and say hi!</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: "events", label: "Event Board", icon: "📅" },
                { id: "crowdfund", label: "Crowdfunding", icon: "💰" },
                { id: "tasks", label: "Task Board", icon: "🤝" },
                { id: "helpers", label: "Local Helpers", icon: "⭐" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-4 font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-transparent text-gray-600 hover:text-orange-600 hover:bg-orange-50/50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  <p className="text-gray-500 text-sm mt-1">Block parties, garage sales, and neighborhood fun</p>
                </div>
                <button onClick={() => setShowEventModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2">
                  <span>+</span> Post Event
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{getEventIcon(event.type)}</span>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{event.attendees} going</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {event.date}</span>
                        <span>🕓 {event.time}</span>
                      </div>
                      <p className="text-xs text-orange-600 font-medium mt-3">🏠 Posted by #{event.houseNumber}</p>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
                      <button onClick={() => setShowDetailModal(event)} className="text-orange-600 font-medium text-sm hover:underline">View Details</button>
                      <button 
                        onClick={() => handleGoingToggle(event.id)}
                        className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                          event.going ? "bg-green-100 text-green-700" : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {event.going ? "✓ Going!" : "I'm Going!"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crowdfunding Tab */}
          {activeTab === "crowdfund" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Crowdfunding</h2>
                  <p className="text-gray-500 text-sm mt-1">Pool resources for block parties and neighborhood events</p>
                </div>
                <button onClick={() => setShowCrowdfundModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2">
                  <span>+</span> Start Campaign
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <span>💡</span>
                  <span>Crowdfunding is for neighborhood celebrations and gatherings. Infrastructure needs should go to your local city council.</span>
                </p>
              </div>

              <div className="space-y-4">
                {crowdfunds.map((fund) => (
                  <div key={fund.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-xl">{fund.title}</h3>
                          {fund.status === "funded" && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ Funded!</span>
                          )}
                        </div>
                        <p className="text-gray-600">{fund.description}</p>
                        <p className="text-xs text-orange-600 font-medium mt-2">🏠 Started by #{fund.houseNumber}</p>
                      </div>
                      <span className="text-2xl ml-4">🎉</span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-900">${fund.raised} raised</span>
                        <span className="text-gray-500">of ${fund.goal} goal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`h-3 rounded-full transition-all ${fund.status === "funded" ? "bg-green-500" : "bg-orange-500"}`}
                          style={{ width: `${Math.min((fund.raised / fund.goal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <span>{fund.backers} neighbors chipped in</span>
                        <span className="mx-2">•</span>
                        <span>Ends {fund.deadline}</span>
                      </div>
                      {fund.status !== "funded" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleChipIn(fund.id, 10)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">$10</button>
                          <button onClick={() => handleChipIn(fund.id, 25)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">$25</button>
                          <button onClick={() => handleChipIn(fund.id, 50)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">$50</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Neighbor Task Board</h2>
                  <p className="text-gray-500 text-sm mt-1">Need a hand? Ask your neighbors!</p>
                </div>
                <button onClick={() => setShowTaskModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2">
                  <span>+</span> Request Help
                </button>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getCategoryIcon(task.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                            <p className="text-xs text-orange-600 font-medium">🏠 House #{task.houseNumber}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.urgency === "high" ? "bg-red-100 text-red-700" :
                            task.urgency === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {task.urgency} priority
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{task.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-orange-600 font-medium">{task.offers} neighbor{task.offers !== 1 && "s"} offered to help</span>
                          <button onClick={() => handleOfferHelp(task.id)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm">
                            I Can Help!
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Helpers Tab */}
          {activeTab === "helpers" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Local Helpers</h2>
                  <p className="text-gray-500 text-sm mt-1">Trusted services from your neighbors</p>
                </div>
                <button onClick={() => setShowHelperModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2">
                  <span>+</span> List Your Service
                </button>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💼</span>
                  <div>
                    <p className="font-semibold text-gray-900">Become a Local Helper</p>
                    <p className="text-sm text-gray-600 mt-1">List your services for just <strong className="text-orange-600">$5/month</strong>. Help neighbors & earn extra income!</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {localHelpers.map((helper) => (
                  <div key={helper.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getServiceIcon(helper.title)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{helper.title}</h3>
                            <p className="text-xs text-orange-600 font-medium">🏠 House #{helper.houseNumber}</p>
                          </div>
                          <span className="text-lg font-bold text-orange-600">{helper.price}</span>
                        </div>
                        <p className="text-gray-600 mt-2 text-sm">{helper.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1 text-amber-600">⭐ {helper.rating}</span>
                          <span className="text-gray-400">({helper.reviews} reviews)</span>
                          <span className="text-gray-500">{helper.availability}</span>
                        </div>
                        <button 
                          onClick={() => setShowContactModal(helper)}
                          className="mt-4 w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
                        >
                          Contact #{helper.houseNumber}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <p className="text-gray-500 text-sm">🏘️ Happy Neighbor encourages real connections — walk over and say hi! 🏘️</p>
          </div>
        </div>

        {/* MODALS */}

        {/* New Event Modal */}
        <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Post a New Event">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Summer BBQ, Garage Sale, etc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="party">🎉 Party / Gathering</option>
                <option value="sale">🏷️ Garage Sale</option>
                <option value="activity">🎯 Activity / Sports</option>
                <option value="meeting">📋 Meeting</option>
                <option value="other">📅 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows="3" placeholder="What should neighbors know about this event?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <button onClick={handleCreateEvent} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Post Event
            </button>
          </div>
        </Modal>

        {/* New Task Modal */}
        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Request Help">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you need help with?</label>
              <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Quick lawn mow, tech help, pet sitting..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="tech">💻 Tech Help</option>
                  <option value="yard">🌿 Yard Work</option>
                  <option value="pets">🐾 Pet Care</option>
                  <option value="moving">📦 Moving Help</option>
                  <option value="errands">🏃 Errands</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={newTask.urgency} onChange={(e) => setNewTask({...newTask, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="low">Low - Whenever</option>
                  <option value="medium">Medium - This Week</option>
                  <option value="high">High - ASAP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows="3" placeholder="Describe what you need, when, and any other details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <button onClick={handleCreateTask} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Post Request
            </button>
          </div>
        </Modal>

        {/* New Crowdfund Modal */}
        <Modal isOpen={showCrowdfundModal} onClose={() => setShowCrowdfundModal(false)} title="Start a Crowdfunding Campaign">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
              <input type="text" value={newCrowdfund.title} onChange={(e) => setNewCrowdfund({...newCrowdfund, title: e.target.value})}
                placeholder="Holiday Party Supplies, Summer BBQ Fund..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount ($)</label>
                <input type="number" value={newCrowdfund.goal} onChange={(e) => setNewCrowdfund({...newCrowdfund, goal: e.target.value})}
                  placeholder="200" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" value={newCrowdfund.deadline} onChange={(e) => setNewCrowdfund({...newCrowdfund, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={newCrowdfund.description} onChange={(e) => setNewCrowdfund({...newCrowdfund, description: e.target.value})}
                rows="3" placeholder="What's this fund for? How will the money be used?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <button onClick={handleCreateCrowdfund} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Start Campaign
            </button>
          </div>
        </Modal>

        {/* New Helper Service Modal */}
        <Modal isOpen={showHelperModal} onClose={() => setShowHelperModal(false)} title="List Your Service">
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
              💼 Listing fee: <strong>$5/month</strong> — helps keep our community spam-free!
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input type="text" value={newHelper.title} onChange={(e) => setNewHelper({...newHelper, title: e.target.value})}
                placeholder="Snow Removal, Lawn Mowing, Dog Walking..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input type="text" value={newHelper.price} onChange={(e) => setNewHelper({...newHelper, price: e.target.value})}
                  placeholder="$20/driveway, $15/hour..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <input type="text" value={newHelper.availability} onChange={(e) => setNewHelper({...newHelper, availability: e.target.value})}
                  placeholder="Weekends, Year-round..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={newHelper.description} onChange={(e) => setNewHelper({...newHelper, description: e.target.value})}
                rows="3" placeholder="Describe your service, what's included, your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <button onClick={handleCreateHelper} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              List Service ($5/month)
            </button>
          </div>
        </Modal>

        {/* Event Detail Modal */}
        <Modal isOpen={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={showDetailModal?.title || "Event Details"}>
          {showDetailModal && (
            <div className="space-y-4">
              <div className="text-4xl text-center">{getEventIcon(showDetailModal.type)}</div>
              <div className="text-center">
                <p className="text-lg text-gray-600">📅 {showDetailModal.date} at {showDetailModal.time}</p>
                <p className="text-sm text-orange-600 font-medium mt-1">🏠 Hosted by #{showDetailModal.houseNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{showDetailModal.description}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="font-semibold text-orange-600">{showDetailModal.attendees}</span> neighbors are going
              </div>
              <button 
                onClick={() => { handleGoingToggle(showDetailModal.id); setShowDetailModal(null); }}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  showDetailModal.going ? "bg-green-100 text-green-700" : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {showDetailModal.going ? "✓ You're Going!" : "I'm Going!"}
              </button>
            </div>
          )}
        </Modal>

        {/* Contact Helper Modal */}
        <Modal isOpen={!!showContactModal} onClose={() => setShowContactModal(null)} title={`Contact #${showContactModal?.houseNumber}`}>
          {showContactModal && (
            <div className="space-y-4 text-center">
              <div className="text-6xl">{getServiceIcon(showContactModal.title)}</div>
              <h3 className="text-xl font-bold text-gray-900">{showContactModal.title}</h3>
              <p className="text-2xl font-bold text-orange-600">{showContactModal.price}</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium">🏠 Walk over to House #{showContactModal.houseNumber}</p>
                <p className="text-sm text-orange-700 mt-2">Ring the doorbell or leave a note to arrange the service!</p>
              </div>
              <p className="text-gray-600 text-sm">
                Happy Neighbor encourages in-person connections. Walking over is the best way to meet your neighbors and arrange services!
              </p>
              <button onClick={() => setShowContactModal(null)} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Got It!
              </button>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Community;
