import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { API_URL } from "../utils/apiConfig";

const TABS = [
  { id: "events", label: "Events" },
  { id: "tasks", label: "Tasks" },
  { id: "helpers", label: "Helpers" },
  { id: "marketplace", label: "Marketplace" },
];

const FALLBACK_NEARBY_STREETS = [
  { id: 101, name: "Oak Lane", city: "Springfield", state: "IL" },
  { id: 102, name: "Cedar Avenue", city: "Springfield", state: "IL" },
  { id: 103, name: "Elm Street", city: "Springfield", state: "IL" },
  { id: 104, name: "Pine Drive", city: "Springfield", state: "IL" },
];

const JOIN_SURVEY_QUESTIONS = [
  { id: "sociability", label: "How important is neighbor sociability in your neighborhood?", scale: "Not important → Very important" },
  { id: "know_names", label: "Do people on your street know each other's names?", scale: "Not at all → Very much so" },
  { id: "events", label: "How often are events (block parties, gatherings) hosted?", scale: "Never → Very often" },
  { id: "walkability", label: "How walkable is your neighborhood?", scale: "Not walkable → Very walkable" },
  { id: "public_schools", label: "How important are good public schools nearby?", scale: "Not important → Very important" },
  { id: "community_sense", label: "How would you rate your street's sense of community?", scale: "None → Strong" },
];

const PARTNER_SHOPS = [
  { id: 1, name: "Tony's Pizza", icon: "🍕", items: [
    { id: 1, name: "Large Cheese Pizza", price: 18.99, serves: "8-10", discount: 10 },
    { id: 2, name: "Party Pack (3 Large)", price: 52.99, serves: "24-30", discount: 15 },
    { id: 3, name: "Breadsticks (12)", price: 6.99, serves: "6-8" },
  ]},
  { id: 2, name: "Sub Station", icon: "🥪", items: [
    { id: 4, name: "Party Sub (6 ft)", price: 89.99, serves: "30-40", discount: 12 },
    { id: 5, name: "Sub Platter (6)", price: 45.99, serves: "12-18" },
  ]},
  { id: 3, name: "Sweet Treats", icon: "🍰", items: [
    { id: 6, name: "Cookie Platter", price: 32.99, serves: "18-24" },
    { id: 7, name: "Cupcake Tray (24)", price: 44.99, serves: "24" },
  ]},
];

const SAMPLE_EVENTS = [
  { id: 1, title: "Summer Block Party", date: "2024-07-15", time: "4:00 PM", host: "247", description: "Bring a dish to share. Games for kids, bounce house, live music.", type: "party", attendees: 12, going: false, needsFunding: true, fundingGoal: 300, fundingRaised: 185, fundingBackers: 9, fundingDescription: "Bounce house, DJ, decorations." },
  { id: 2, title: "Neighborhood Garage Sale", date: "2024-06-22", time: "8:00 AM", host: "Multiple", description: "Multi-family garage sale. Maps at Oak & Main.", type: "sale", attendees: 8, going: false, needsFunding: false },
];

const SAMPLE_TASKS = [
  { id: 1, title: "Help setting up new computer", category: "tech", host: "267", description: "Need help transferring files. Coffee provided!", urgency: "low", offers: 2 },
  { id: 2, title: "Lawn mow while on vacation", category: "yard", host: "134", description: "One mow July 14–20. Will pay!", urgency: "medium", offers: 1 },
];

const SAMPLE_HELPERS = [
  { id: 1, title: "Snow Removal", host: "156", price: "$20/driveway", description: "Shovel driveway and walkway. Salt included.", availability: "Winter" },
  { id: 2, title: "Lawn Mowing", host: "423", price: "$25/mow", description: "Weekly or one-time. Edging included.", availability: "Spring–Fall" },
];

const SAMPLE_LISTINGS = [
  { id: 1, title: "Vintage Wooden Desk", price: 150, host: "247", description: "Solid oak, 48×24×30. Some wear.", category: "furniture", image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=256&h=256&fit=crop" },
  { id: 2, title: "Kids Bike 20\"", price: 45, host: "189", description: "Blue Schwinn, training wheels included.", category: "sports", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=256&h=256&fit=crop" },
];

const Community = () => {
  const { streetId } = useParams();
  const isDemo = streetId === "demo";
  const [street, setStreet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(isDemo);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [activeTab, setActiveTab] = useState("events");

  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [helpers, setHelpers] = useState(SAMPLE_HELPERS);
  const [listings, setListings] = useState(SAMPLE_LISTINGS);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const [outgoingInvites, setOutgoingInvites] = useState([]);
  const [incomingInvites, setIncomingInvites] = useState([
    { id: 1, fromStreet: "Oak Lane", fromCity: "Springfield", fromState: "IL", ourApprovals: 3, theirApprovals: 6 },
  ]);
  const [nearbyStreets, setNearbyStreets] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showJoinSurvey, setShowJoinSurvey] = useState(false);
  const [joinSurveyAnswers, setJoinSurveyAnswers] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: "", date: "", time: "", description: "", type: "party",
    needsFunding: false, fundingGoal: "", fundingDescription: "",
    partnerShopItems: [],
  });

  useEffect(() => {
    if (isDemo) {
      setStreet({ name: "Maple Street", city: "Springfield", state: "IL" });
      setLoading(false);
      return;
    }
    const fetchStreet = async () => {
      try {
        const res = await fetch(`${API_URL}/streets/${streetId}/vibe`);
        if (res.ok) {
          const data = await res.json();
          setStreet(data.street);
        }
      } catch {
        setStreet({ name: "Street", city: "", state: "" });
      } finally {
        setLoading(false);
      }
    };
    fetchStreet();
  }, [streetId, isDemo]);

  useEffect(() => {
    if (isDemo) return;
    const verifiedId = localStorage.getItem("verifiedStreetId");
    const verifiedList = JSON.parse(localStorage.getItem("verifiedStreets") || "[]");
    if (verifiedId && parseInt(verifiedId) === parseInt(streetId)) setIsVerified(true);
    else if (verifiedList.includes(parseInt(streetId))) setIsVerified(true);
  }, [streetId, isDemo]);

  useEffect(() => {
    if (isVerified && !loading) {
      const key = `communitySurveyDone_${isDemo ? "demo" : streetId}`;
      if (!localStorage.getItem(key)) setShowJoinSurvey(true);
    }
  }, [isVerified, loading, isDemo, streetId]);

  const fetchNearbyStreets = async () => {
    setNearbyLoading(true);
    try {
      let lat, lon;
      if (street?.latitude && street?.longitude) {
        lat = parseFloat(street.latitude);
        lon = parseFloat(street.longitude);
      } else if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } else {
        setNearbyStreets(FALLBACK_NEARBY_STREETS);
        return;
      }
      const res = await fetch(`${API_URL}/nearby-streets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      if (res.ok && data.streets?.length) {
        setNearbyStreets(data.streets);
      } else {
        setNearbyStreets(FALLBACK_NEARBY_STREETS);
      }
    } catch {
      setNearbyStreets(FALLBACK_NEARBY_STREETS);
    } finally {
      setNearbyLoading(false);
    }
  };

  useEffect(() => {
    if (showNeighborhoodModal && nearbyStreets.length === 0 && !nearbyLoading) {
      fetchNearbyStreets();
    }
  }, [showNeighborhoodModal]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setVerifyError("Enter a code");
      return;
    }
    if (isDemo && verificationCode.toUpperCase() === "DEMO") {
      setIsVerified(true);
      localStorage.setItem("demoVerified", "true");
      setVerifyError("");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/community/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streetId, code: verificationCode }),
      });
      const data = await res.json();
      if (data.verified) {
        setIsVerified(true);
        const list = JSON.parse(localStorage.getItem("verifiedStreets") || "[]");
        list.push(parseInt(streetId));
        localStorage.setItem("verifiedStreets", JSON.stringify(list));
        setVerifyError("");
      } else {
        setVerifyError(data.error || "Invalid code");
      }
    } catch {
      setVerifyError("Verification failed");
    }
  };

  const handlePostEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    const evt = {
      id: Date.now(),
      ...newEvent,
      host: "You",
      attendees: 1,
      going: true,
      needsFunding: newEvent.needsFunding,
      fundingGoal: newEvent.needsFunding ? parseInt(newEvent.fundingGoal) || 0 : 0,
      fundingRaised: 0,
      fundingBackers: 0,
      fundingDescription: newEvent.fundingDescription || "",
    };
    setEvents([evt, ...events]);
    setNewEvent({ title: "", date: "", time: "", description: "", type: "party", needsFunding: false, fundingGoal: "", fundingDescription: "", partnerShopItems: [] });
    setShowEventModal(false);
    setShowFoodPicker(false);
  };

  const addFoodItem = (shop, item) => {
    const entry = { shopId: shop.id, shopName: shop.name, shopIcon: shop.icon, itemId: item.id, itemName: item.name, price: item.price, discount: item.discount || 0, quantity: 1 };
    setNewEvent({ ...newEvent, partnerShopItems: [...newEvent.partnerShopItems, entry] });
    setShowFoodPicker(false);
  };

  const removeFoodItem = (idx) => {
    setNewEvent({ ...newEvent, partnerShopItems: newEvent.partnerShopItems.filter((_, i) => i !== idx) });
  };

  const handleGoing = (eid) => {
    setEvents(events.map(e => e.id === eid ? { ...e, going: !e.going, attendees: e.going ? e.attendees - 1 : e.attendees + 1 } : e));
  };

  const handleChipIn = (eid, amount) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eid || !e.needsFunding) return e;
      return { ...e, fundingRaised: (e.fundingRaised || 0) + amount, fundingBackers: (e.fundingBackers || 0) + 1 };
    }));
  };

  const handleInviteStreet = (street) => {
    setOutgoingInvites(prev => [...prev, { ...street, ourApprovals: 1, theirApprovals: 0 }]);
  };

  const handleApproveIncoming = (inviteId) => {
    setIncomingInvites(prev => prev.map(inv => inv.id === inviteId ? { ...inv, ourApprovals: Math.min(6, (inv.ourApprovals || 0) + 1) } : inv));
  };

  const handleApproveOutgoing = (invStreetId) => {
    setOutgoingInvites(prev => prev.map(inv => inv.id === invStreetId ? { ...inv, ourApprovals: Math.min(6, (inv.ourApprovals || 0) + 1) } : inv));
  };

  const handleJoinSurveySubmit = async () => {
    const key = `communitySurveyDone_${isDemo ? "demo" : streetId}`;
    localStorage.setItem(key, "1");
    localStorage.setItem(`communitySurveyData_${isDemo ? "demo" : streetId}`, JSON.stringify(joinSurveyAnswers));
    try {
      await fetch(`${API_URL}/community/hub-survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streetId: isDemo ? "demo" : streetId,
          streetName: street?.name,
          city: street?.city,
          state: street?.state,
          ...joinSurveyAnswers,
        }),
      });
    } catch (_) {}
    setShowJoinSurvey(false);
    setJoinSurveyAnswers({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="w-8 h-8 border-2 border-leaf-pale border-t-leaf rounded-full animate-spin" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <>
        <Helmet><title>Verify | Happy Neighbor</title></Helmet>
        <div className="min-h-screen flex flex-col bg-warm-50">
          <Nav />
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-sm w-full">
              <h2 className="font-serif text-xl font-semibold text-stone-900 mb-2">Verify access</h2>
              <p className="text-stone-600 text-sm mb-4">
                {isDemo ? "Enter DEMO to explore." : `Residents of ${street?.name || "this street"} only.`}
              </p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => { setVerificationCode(e.target.value); setVerifyError(""); }}
                placeholder={isDemo ? "DEMO" : "Code"}
                className="w-full px-4 py-3 border border-stone-300 mb-2"
              />
              {verifyError && <p className="text-sm text-red-600 mb-2">{verifyError}</p>}
              <button onClick={handleVerify} className="w-full py-3 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors">
                Unlock
              </button>
              {!isDemo && (
                <p className="mt-4 text-sm text-stone-500 text-center">
                  <Link to="/community" className="text-leaf hover:text-leaf-dark transition-colors">Join your hub</Link> to get a code.
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{street?.name || "Community"} | Happy Neighbor</title></Helmet>
      <div className="min-h-screen flex flex-col bg-warm-50">
        <Nav />
        <header className="border-b border-stone-200 bg-white relative">
          <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-leaf-pale text-leaf rounded-sm mb-2">
                  {isDemo ? "Demo" : "Verified"}
                </span>
                <h1 className="font-serif text-2xl font-semibold text-stone-900">
                  {street?.name || "Maple Street"}
                </h1>
                <p className="text-stone-500 text-sm">{street?.city} {street?.state && `, ${street.state}`}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                  aria-label="Menu"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {showMenuDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenuDropdown(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white border border-stone-200 rounded shadow-lg z-50">
                      <button
                        onClick={() => { setShowNeighborhoodModal(true); setShowMenuDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        Invite streets
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 flex-1">
          <div className="border-b border-stone-200 flex gap-1 pt-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t transition-colors ${
                  activeTab === tab.id ? "bg-white border border-stone-200 border-b-white -mb-px text-leaf" : "text-stone-500 hover:text-stone-700 hover:bg-stone-50/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8 bg-white border border-t-0 border-stone-200 min-h-[320px]">
            {activeTab === "events" && (
              <div className="space-y-4 px-1">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pl-1 pr-2">
                  <p className="text-sm text-stone-500">What&apos;s happening on your street</p>
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="px-4 py-2 text-sm font-medium text-stone-900 bg-leaf-pale border border-leaf/30 rounded hover:bg-leaf hover:text-white hover:border-leaf transition-colors mr-2"
                  >
                    Post event
                  </button>
                </div>
                {events.map((e) => (
                  <div key={e.id} className="border border-stone-100 bg-warm-50/50 p-5 hover:border-stone-200 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-leaf-pale text-leaf rounded-sm mb-2">{e.type}</span>
                        <h3 className="font-medium text-stone-900">{e.title}</h3>
                        <p className="text-sm text-stone-500 mt-1">{e.date} · {e.time} · #{e.host}</p>
                        <p className="text-stone-600 mt-2 text-sm leading-relaxed">{e.description}</p>
                        {e.needsFunding && (
                          <div className="mt-3 p-3 bg-white border border-stone-100 rounded">
                            <p className="text-xs font-medium text-stone-500 mb-1">Chip in: {e.fundingDescription}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                                  style={{
                                    width: `${e.fundingGoal > 0 ? Math.min(100, ((e.fundingRaised || 0) / e.fundingGoal) * 100) : 0}%`,
                                    background: "linear-gradient(to right, #c4915c 0%, #7a9a85 50%, #5c7f6c 100%)",
                                  }}
                                />
                              </div>
                              <span className="text-sm text-stone-600">${e.fundingRaised || 0} / ${e.fundingGoal}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {[10, 25, 50].map((amt) => (
                                <button key={amt} onClick={() => handleChipIn(e.id, amt)} className="px-3 py-1 text-sm border border-stone-200 hover:border-leaf hover:text-leaf transition-colors">
                                  $ {amt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-stone-400">{e.attendees} going</span>
                        <button onClick={() => handleGoing(e.id)} className={`text-sm px-3 py-1 border transition-colors ${e.going ? "border-leaf bg-leaf-pale text-leaf" : "border-stone-200 hover:border-leaf"}`}>
                          {e.going ? "Going" : "I'm going"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "tasks" && (
              <div className="space-y-4 px-1">
                <p className="text-sm text-stone-500 mb-4">Ask for help or lend a hand</p>
                {tasks.map((t) => (
                  <div key={t.id} className="border border-stone-100 bg-warm-50/50 p-5 hover:border-stone-200 transition-colors">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-citrus-muted text-citrus rounded-sm mb-2">{t.category}</span>
                    <h3 className="font-medium text-stone-900">{t.title}</h3>
                    <p className="text-sm text-stone-500 mt-1">#{t.host}</p>
                    <p className="text-stone-600 mt-2 text-sm">{t.description}</p>
                    <button className="mt-3 text-sm font-medium text-leaf hover:text-leaf-dark transition-colors">Offer help →</button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "helpers" && (
              <div className="space-y-4 px-1">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-stone-500">Services you can hire from neighbors</p>
                  <Link to="/helpers-signup" className="text-sm font-medium text-leaf hover:text-leaf-dark">
                    + List your service
                  </Link>
                </div>
                <div className="mb-4 p-4 bg-leaf-pale/50 border border-leaf/20 rounded text-sm text-stone-700">
                  List your service to your neighborhood for <strong>$10/month</strong>. Reach neighbors looking for lawn care, snow removal, tech help, and more. <Link to="/helpers-signup" className="text-leaf font-medium hover:underline">Get started →</Link>
                </div>
                {helpers.map((h) => (
                  <div key={h.id} className="border border-stone-100 bg-warm-50/50 p-5 hover:border-stone-200 transition-colors">
                    <h3 className="font-medium text-stone-900">{h.title}</h3>
                    <p className="text-sm text-leaf font-medium mt-0.5">{h.price}</p>
                    <p className="text-stone-600 mt-2 text-sm">{h.description}</p>
                    <span className="text-xs text-stone-400 block mt-2">{h.availability}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "marketplace" && (
              <div className="space-y-4 px-1">
                <p className="text-sm text-stone-500 mb-4">Buy, sell, or give stuff to neighbors</p>
                {listings.map((l) => (
                  <div key={l.id} className="border border-stone-100 bg-warm-50/50 hover:border-stone-200 transition-colors flex gap-4 overflow-hidden rounded">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-stone-100 overflow-hidden">
                      {l.image ? (
                        <img src={l.image} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-stone-300">
                          {l.category === "furniture" ? "🪑" : l.category === "sports" ? "🚲" : "📦"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-5 pr-5">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600 rounded-sm mb-2">{l.category}</span>
                      <h3 className="font-medium text-stone-900">{l.title}</h3>
                      <p className="text-stone-600 mt-2 text-sm line-clamp-2">{l.description}</p>
                    </div>
                    <div className="flex flex-col justify-center font-semibold text-stone-900">{l.price === 0 ? <span className="text-leaf">Free</span> : `$${l.price}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowEventModal(false)}>
            <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-4">Post an event</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                    <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Block Party" className="w-full px-3 py-2 border border-stone-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                      <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full px-3 py-2 border border-stone-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Time</label>
                      <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full px-3 py-2 border border-stone-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                    <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} rows={3} placeholder="What's happening?" className="w-full px-3 py-2 border border-stone-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                    <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} className="w-full px-3 py-2 border border-stone-300">
                      <option value="party">Party</option>
                      <option value="sale">Garage sale</option>
                      <option value="activity">Activity</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>

                  {/* Fundraising */}
                  <div className="border-t border-stone-200 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newEvent.needsFunding} onChange={e => setNewEvent({ ...newEvent, needsFunding: e.target.checked })} />
                      <span className="text-sm font-medium text-stone-700">Enable fundraising (let neighbors chip in)</span>
                    </label>
                    {newEvent.needsFunding && (
                      <div className="mt-3 space-y-2">
                        <input type="number" placeholder="Funding goal ($)" value={newEvent.fundingGoal} onChange={e => setNewEvent({ ...newEvent, fundingGoal: e.target.value })} className="w-full px-3 py-2 border border-stone-300" />
                        <input type="text" placeholder="What's it for? (e.g. bounce house, food)" value={newEvent.fundingDescription} onChange={e => setNewEvent({ ...newEvent, fundingDescription: e.target.value })} className="w-full px-3 py-2 border border-stone-300" />
                      </div>
                    )}
                  </div>

                  {/* Add food from local shops */}
                  <div className="border-t border-stone-200 pt-4">
                    <p className="text-sm font-medium text-stone-700 mb-2">Add food for your event</p>
                    <button onClick={() => setShowFoodPicker(true)} className="text-sm text-leaf hover:text-leaf-dark font-medium">
                      + Add from local shop (pizza, subs, etc.)
                    </button>
                    {newEvent.partnerShopItems.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {newEvent.partnerShopItems.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm">
                            <span>{item.shopIcon} {item.itemName} × {item.quantity} — ${(item.price * (1 - (item.discount || 0) / 100) * item.quantity).toFixed(2)}</span>
                            <button onClick={() => removeFoodItem(idx)} className="text-red-600 hover:underline">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowEventModal(false)} className="px-4 py-2 border border-stone-300 text-stone-700">Cancel</button>
                  <button onClick={handlePostEvent} className="flex-1 py-2 bg-leaf text-white font-medium hover:bg-leaf-dark">Post event</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Food picker */}
        {showFoodPicker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => setShowFoodPicker(false)}>
            <div className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto rounded shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="font-semibold text-stone-900 mb-2">Add food from local businesses</h3>
                <p className="text-sm text-stone-500 mb-4">One-click add catering for your event. <Link to="/businesses" className="text-leaf hover:underline">List your business</Link></p>
                {PARTNER_SHOPS.map((shop) => (
                  <div key={shop.id} className="border border-stone-200 rounded p-3 mb-3">
                    <p className="font-medium text-stone-900 mb-2">{shop.icon} {shop.name}</p>
                    <div className="space-y-1">
                      {shop.items.map((item) => (
                        <button key={item.id} onClick={() => addFoodItem(shop, item)} className="w-full text-left text-sm px-2 py-1.5 hover:bg-leaf-pale/60 rounded flex justify-between">
                          <span>{item.name} — serves {item.serves}</span>
                          <span className="text-leaf">${item.discount ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => setShowFoodPicker(false)} className="w-full py-2 border border-stone-300 text-stone-600">Done</button>
              </div>
            </div>
          </div>
        )}

        {/* Neighborhood / Invite streets modal */}
        {showNeighborhoodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowNeighborhoodModal(false)}>
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Invite streets</h3>
                <p className="text-sm text-stone-500 mb-4">Connect with nearby streets. Requires 5+ approvals from each street to link.</p>

                {incomingInvites.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-stone-700 mb-3">Incoming invites</h4>
                    <div className="space-y-2">
                      {incomingInvites.map((inv) => (
                        <div key={inv.id} className="border border-stone-200 bg-leaf-pale/30 p-3 rounded flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-stone-900 text-sm">{inv.fromStreet}</p>
                            <p className="text-xs text-stone-500">{inv.ourApprovals || 0}/5 us · {inv.theirApprovals || 0}/5 them</p>
                          </div>
                          <button onClick={() => handleApproveIncoming(inv.id)} className="px-3 py-1 text-sm font-medium border border-leaf text-leaf hover:bg-leaf hover:text-white transition-colors rounded">Approve</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {outgoingInvites.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-stone-700 mb-3">Your invites (pending)</h4>
                    <div className="space-y-2">
                      {outgoingInvites.map((inv) => (
                        <div key={inv.id} className="border border-stone-200 bg-warm-50/80 p-3 rounded flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-stone-900 text-sm">{inv.name}</p>
                            <p className="text-xs text-stone-500">{inv.ourApprovals || 0}/5 us · {inv.theirApprovals || 0}/5 them</p>
                          </div>
                          <button onClick={() => handleApproveOutgoing(inv.id)} className="px-3 py-1 text-sm font-medium border border-stone-300 text-stone-700 hover:bg-stone-100 rounded">Approve</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Invite a nearby street</h4>
                  {nearbyLoading ? (
                    <p className="text-sm text-stone-500 py-4">Finding nearby streets…</p>
                  ) : (
                    <div className="space-y-2">
                      {(nearbyStreets.length ? nearbyStreets : FALLBACK_NEARBY_STREETS)
                        .filter(s => !outgoingInvites.some(o => o.id === s.id || (o.name === s.name && o.city === s.city)))
                        .map((s) => (
                          <div key={s.id} className="border border-stone-200 p-3 rounded flex items-center justify-between">
                            <span className="text-sm text-stone-800">{s.name}, {s.city}{s.state ? `, ${s.state}` : ""}</span>
                            <button onClick={() => handleInviteStreet(s)} className="px-3 py-1 text-sm font-medium text-leaf border border-leaf hover:bg-leaf hover:text-white transition-colors rounded">Invite</button>
                          </div>
                        ))}
                      {(nearbyStreets.length ? nearbyStreets : FALLBACK_NEARBY_STREETS).filter(s => !outgoingInvites.some(o => o.id === s.id || (o.name === s.name && o.city === s.city))).length === 0 && (
                        <p className="text-sm text-stone-500">No more nearby streets to invite.</p>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={() => setShowNeighborhoodModal(false)} className="w-full mt-6 py-2 border border-stone-300 text-stone-700">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Join survey modal */}
        {showJoinSurvey && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded shadow-lg p-6">
              <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Quick neighborhood survey</h3>
              <p className="text-sm text-stone-500 mb-6">Help us learn about your area. 0 = Not at all / Not important, 4 = Very much so / Very important.</p>
              <div className="space-y-5">
                {JOIN_SURVEY_QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-stone-700 mb-2">{q.label}</label>
                    <p className="text-xs text-stone-500 mb-2">{q.scale}</p>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setJoinSurveyAnswers(prev => ({ ...prev, [q.id]: n }))}
                          className={`w-10 h-10 text-sm font-medium border rounded transition-colors ${
                            joinSurveyAnswers[q.id] === n
                              ? "border-leaf bg-leaf text-white"
                              : "border-stone-300 text-stone-600 hover:border-stone-400"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { localStorage.setItem(`communitySurveyDone_${isDemo ? "demo" : streetId}`, "1"); setShowJoinSurvey(false); setJoinSurveyAnswers({}); }}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={handleJoinSurveySubmit}
                  className="flex-1 py-2 bg-leaf text-stone-900 font-medium hover:bg-leaf-dark"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default Community;
