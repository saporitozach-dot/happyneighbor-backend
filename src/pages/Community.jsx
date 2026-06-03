import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PartyPlannerModal from "../components/PartyPlannerModal";
import BrandIcon from "../components/brand/BrandIcon";
import HubIconMark from "../components/brand/HubIconMark";
import HubCategoryChip from "../components/hub/HubCategoryChip";
import HubHeader from "../components/hub/HubHeader";
import HubTabBar from "../components/hub/HubTabBar";
import HubOverview from "../components/hub/HubOverview";
import HubEventsPanel from "../components/hub/HubEventsPanel";
import HubBoardPanel from "../components/hub/HubBoardPanel";
import HubNeighborsPanel from "../components/hub/HubNeighborsPanel";
import HubBoardPostModal from "../components/hub/HubBoardPostModal";
import HubNeighborModal, { HubNeighborContactModal } from "../components/hub/HubNeighborModal";
import HubChipInModal from "../components/hub/HubChipInModal";
import HubRsvpModal from "../components/hub/HubRsvpModal";
import HubBoardDetailModal from "../components/hub/HubBoardDetailModal";
import HubBoardRespondModal from "../components/hub/HubBoardRespondModal";
import HubEndorseModal from "../components/hub/HubEndorseModal";
import HubSuccessModal from "../components/hub/HubSuccessModal";
import { DEMO_EVENTS, DEMO_BOARD_POSTS, DEMO_NEIGHBORS } from "../data/demoHubData";
import * as hubApi from "../utils/hubApi";
import {
  HUB_TABS,
  getEventTypeLabel,
  getEventTypeIcon,
  getServiceCategoryIcon,
  getServiceCategoryLabel,
  formatHouse,
} from "../utils/hubUi";

const API_URL = import.meta.env.VITE_API_URL || "https://happyneighbor-api-production.up.railway.app/api";

// Modal Component - defined outside to prevent re-creation on each render
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white border border-slate-200 shadow-card rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const { streetId } = useParams();
  const [activeTab, setActiveTab] = useState("home");
  const [street, setStreet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPartyPlanner, setShowPartyPlanner] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showNeighborOfferModal, setShowNeighborOfferModal] = useState(false);
  const [neighborContact, setNeighborContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [boardDraft, setBoardDraft] = useState({
    type: "ask",
    title: "",
    description: "",
    category: "other",
    urgency: "low",
    listingType: "sell",
    price: "",
  });
  const [neighborDraft, setNeighborDraft] = useState({
    headline: "",
    description: "",
    compensation: "",
    availability: "",
  });
  const [chipInEvent, setChipInEvent] = useState(null);
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [boardDetailPost, setBoardDetailPost] = useState(null);
  const [boardRespond, setBoardRespond] = useState(null);
  const [endorsePost, setEndorsePost] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [hubSubmitting, setHubSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [newEvent, setNewEvent] = useState({ 
    title: "", date: "", time: "", description: "", type: "party",
    needsFunding: false, fundingGoal: "", fundingDescription: "",
    partnerShopItems: [] // Array of selected items from partner shops
  });
  const [showPartnerShops, setShowPartnerShops] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  // Partner shops data
  const partnerShops = [
    {
      id: 1,
      name: "Tony's Pizza",
      type: "pizza",
      description: "Local favorite for block parties",
      items: [
        { id: 1, name: "Large Cheese Pizza", price: 18.99, serves: "8-10 people" },
        { id: 2, name: "Large Pepperoni Pizza", price: 21.99, serves: "8-10 people" },
        { id: 3, name: "Party Pack (3 Large Pizzas)", price: 52.99, serves: "24-30 people" },
        { id: 4, name: "Breadsticks (12 pieces)", price: 6.99, serves: "6-8 people" },
        { id: 5, name: "Wings (20 pieces)", price: 24.99, serves: "8-10 people" },
      ]
    },
    {
      id: 2,
      name: "Sub Station",
      type: "subs",
      description: "Fresh subs for any gathering",
      items: [
        { id: 6, name: "Party Sub (6 feet)", price: 89.99, serves: "30-40 people" },
        { id: 7, name: "Party Sub (3 feet)", price: 49.99, serves: "15-20 people" },
        { id: 8, name: "12-inch Sub Platter (6 subs)", price: 45.99, serves: "12-18 people" },
        { id: 9, name: "Wrap Platter (10 wraps)", price: 39.99, serves: "10 people" },
        { id: 10, name: "Salad Platter (large)", price: 34.99, serves: "12-15 people" },
      ]
    },
    {
      id: 3,
      name: "BBQ Express",
      type: "bbq",
      description: "Catering for neighborhood events",
      items: [
        { id: 11, name: "BBQ Platter (feeds 20)", price: 149.99, serves: "20 people" },
        { id: 12, name: "Pulled Pork (5 lbs)", price: 64.99, serves: "15-20 people" },
        { id: 13, name: "Chicken Wings (50 pieces)", price: 54.99, serves: "15-20 people" },
        { id: 14, name: "Side Dishes Platter", price: 29.99, serves: "12-15 people" },
      ]
    },
    {
      id: 4,
      name: "Sweet Treats Bakery",
      type: "desserts",
      description: "Desserts for special occasions",
      items: [
        { id: 15, name: "Cookie Platter (3 dozen)", price: 32.99, serves: "18-24 people" },
        { id: 16, name: "Cupcake Tray (24 cupcakes)", price: 44.99, serves: "24 people" },
        { id: 17, name: "Sheet Cake (serves 30)", price: 59.99, serves: "30 people" },
        { id: 18, name: "Brownie Platter (2 dozen)", price: 28.99, serves: "24 people" },
      ]
    },
    {
      id: 5,
      name: "Beverage Express",
      type: "drinks",
      description: "Drinks for your event",
      items: [
        { id: 19, name: "Soda Pack (48 cans)", price: 24.99, serves: "24-30 people" },
        { id: 20, name: "Water Bottles (48 pack)", price: 19.99, serves: "48 people" },
        { id: 21, name: "Lemonade (5 gallons)", price: 34.99, serves: "40-50 people" },
        { id: 22, name: "Juice Boxes (36 pack)", price: 22.99, serves: "36 people" },
      ]
    }
  ];
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [boardPosts, setBoardPosts] = useState(DEMO_BOARD_POSTS);
  const [neighbors, setNeighbors] = useState(DEMO_NEIGHBORS);

  const isDemo = streetId === "demo";

  useEffect(() => {
    fetchStreetData();
    checkVerification();
  }, [streetId]);

  useEffect(() => {
    if (isVerified && streetId) loadHubFromApi();
  }, [isVerified, streetId]);

  const loadHubFromApi = async () => {
    const result = await hubApi.fetchHubData(streetId);
    if (!result.ok || !result.data) return;
    const { events: apiEvents, boardPosts: apiBoard, neighbors: apiNeighbors } = result.data;
    if (apiEvents?.length) setEvents(apiEvents);
    if (apiBoard?.length) setBoardPosts(apiBoard);
    if (apiNeighbors?.length) setNeighbors(apiNeighbors);
  };

  const showSuccess = (title, message, detail, actionLabel, onAction) => {
    setSuccessModal({ title, message, detail, actionLabel, onAction });
  };

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
  // Partner shop functions
  const handleAddShopItem = (shopId, item) => {
    const shop = partnerShops.find(s => s.id === shopId);
    const newItem = {
      shopId,
      shopName: shop.name,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      serves: item.serves,
      quantity: 1
    };
    setNewEvent({
      ...newEvent,
      partnerShopItems: [...newEvent.partnerShopItems, newItem]
    });
  };

  const handleRemoveShopItem = (index) => {
    const updatedItems = newEvent.partnerShopItems.filter((_, i) => i !== index);
    setNewEvent({ ...newEvent, partnerShopItems: updatedItems });
  };

  const handleUpdateItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const updatedItems = [...newEvent.partnerShopItems];
    updatedItems[index].quantity = quantity;
    setNewEvent({ ...newEvent, partnerShopItems: updatedItems });
  };

  const getTotalShopCost = () => {
    return newEvent.partnerShopItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const pizzaPartnerShops = partnerShops.filter((shop) => shop.type === "pizza");

  const handlePublishFromPlanner = async (planned) => {
    const eventPayload = {
      ...planned,
      houseNumber: "Your House",
      attendees: 1,
      going: true,
      fundingGoal: parseInt(planned.fundingGoal, 10) || 0,
      fundingRaised: 0,
      fundingBackers: 0,
    };
    const result = await hubApi.createHubEvent(streetId, eventPayload);
    const event = result.ok && result.data?.event
      ? result.data.event
      : { id: Date.now(), ...eventPayload };
    setEvents([event, ...events]);
    setActiveTab("events");
    showSuccess(
      "Block party planned",
      "Your event is live on the hub. Neighbors can RSVP and chip in.",
      planned.title,
      "View event",
      () => {
        setSuccessModal(null);
        setShowDetailModal(event);
      }
    );
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      setFormError("Please fill in title, date, and time");
      return;
    }
    if (newEvent.needsFunding && !newEvent.fundingGoal) {
      setFormError("Please enter a funding goal amount");
      return;
    }
    setFormError("");
    setHubSubmitting(true);
    const eventPayload = {
      ...newEvent,
      houseNumber: "Your House",
      attendees: 1,
      going: true,
      fundingGoal: newEvent.needsFunding ? parseInt(newEvent.fundingGoal, 10) : 0,
      fundingRaised: 0,
      fundingBackers: 0,
    };
    const result = await hubApi.createHubEvent(streetId, eventPayload);
    const event = result.ok && result.data?.event
      ? result.data.event
      : { id: Date.now(), ...eventPayload };
    setEvents([event, ...events]);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      description: "",
      type: "party",
      needsFunding: false,
      fundingGoal: "",
      fundingDescription: "",
      partnerShopItems: [],
    });
    setShowPartnerShops(false);
    setSelectedShop(null);
    setShowEventModal(false);
    setHubSubmitting(false);
    showSuccess("Event posted", "Neighbors on your block can see it and RSVP.", event.title);
  };

  const resetBoardDraft = () =>
    setBoardDraft({
      type: "ask",
      title: "",
      description: "",
      category: "other",
      urgency: "low",
      listingType: "sell",
      price: "",
    });

  const handleCreateBoardPost = async () => {
    if (!boardDraft.title?.trim() || !boardDraft.description?.trim()) {
      setFormError("Please add a title and description");
      return;
    }
    if (boardDraft.type === "share" && boardDraft.listingType === "sell" && !boardDraft.price) {
      setFormError("Please enter a price for items you're selling");
      return;
    }
    setFormError("");
    setHubSubmitting(true);
    const base = {
      title: boardDraft.title.trim(),
      description: boardDraft.description.trim(),
      houseNumber: "Your House",
    };
    let postPayload;
    if (boardDraft.type === "ask") {
      postPayload = { ...base, type: "ask", category: boardDraft.category, urgency: boardDraft.urgency, responses: 0 };
    } else if (boardDraft.type === "share") {
      postPayload = {
        ...base,
        type: "share",
        listingType: boardDraft.listingType,
        category: boardDraft.listingType === "free" ? "free" : "other",
        price: boardDraft.listingType === "sell" ? parseInt(boardDraft.price, 10) || 0 : 0,
        interested: 0,
      };
    } else {
      postPayload = { ...base, type: "recommend", endorsedBy: 1 };
    }
    const result = await hubApi.createHubBoardPost(streetId, postPayload);
    const post = result.ok && result.data?.post ? result.data.post : { id: Date.now(), ...postPayload };
    setBoardPosts([post, ...boardPosts]);
    resetBoardDraft();
    setShowBoardModal(false);
    setHubSubmitting(false);
    setActiveTab("board");
    showSuccess("Posted to the block board", "Neighbors can respond and walk over to coordinate.", post.title);
  };

  const openBoardRespond = (post, type) => {
    setBoardDetailPost(null);
    setBoardRespond({ post, type });
  };

  const handleBoardRespondSubmit = async ({ message, houseNumber, type }) => {
    if (!boardRespond?.post) return;
    setHubSubmitting(true);
    const { post } = boardRespond;
    const result = await hubApi.respondToBoardPost(streetId, post.id, { type, message, houseNumber });
    const updated = result.ok && result.data?.post
      ? result.data.post
      : {
          ...post,
          ...(type === "ask"
            ? { responses: (post.responses || 0) + 1 }
            : { interested: (post.interested || 0) + 1 }),
        };
    setBoardPosts(boardPosts.map((p) => (p.id === post.id ? updated : p)));
    setBoardRespond(null);
    setHubSubmitting(false);
    showSuccess(
      type === "ask" ? "Offer sent" : "Interest sent",
      `Your message is logged. Walk over to ${formatHouse(post.houseNumber)} to finish up in person.`,
      message || "No message added"
    );
  };

  const handleEndorseSubmit = async () => {
    if (!endorsePost) return;
    setHubSubmitting(true);
    const result = await hubApi.endorseBoardPost(streetId, endorsePost.id, {});
    const updated = result.ok && result.data?.post
      ? result.data.post
      : { ...endorsePost, endorsedBy: (endorsePost.endorsedBy || 0) + 1 };
    setBoardPosts(boardPosts.map((p) => (p.id === endorsePost.id ? updated : p)));
    setEndorsePost(null);
    setHubSubmitting(false);
    showSuccess("Tip endorsed", "Your block will see this recommendation.", endorsePost.title);
  };

  const handleCreateNeighborOffer = async () => {
    if (!neighborDraft.headline?.trim() || !neighborDraft.description?.trim()) {
      setFormError("Please add what you offer and a short description");
      return;
    }
    setFormError("");
    setHubSubmitting(true);
    const payload = {
      headline: neighborDraft.headline.trim(),
      description: neighborDraft.description.trim(),
      houseNumber: "Your House",
      compensation: neighborDraft.compensation || "Coordinate in person",
      availability: neighborDraft.availability || "Flexible",
      skillIcon: getServiceCategoryIcon(neighborDraft.headline),
      endorsements: 0,
    };
    const result = await hubApi.createHubNeighbor(streetId, payload);
    const entry = result.ok && result.data?.neighbor ? result.data.neighbor : { id: Date.now(), ...payload };
    setNeighbors([entry, ...neighbors]);
    setNeighborDraft({ headline: "", description: "", compensation: "", availability: "" });
    setShowNeighborOfferModal(false);
    setHubSubmitting(false);
    setActiveTab("neighbors");
    showSuccess("Skill listed", "Neighbors can say hello at your house when they need help.", entry.headline);
  };

  const handleChipInSubmit = async ({ amount, note, houseNumber }) => {
    if (!chipInEvent) return;
    setHubSubmitting(true);
    const result = await hubApi.chipInToEvent(streetId, chipInEvent.id, { amount, note, houseNumber });
    const updated = result.ok && result.data?.event
      ? result.data.event
      : {
          ...chipInEvent,
          fundingRaised: (chipInEvent.fundingRaised || 0) + amount,
          fundingBackers: (chipInEvent.fundingBackers || 0) + 1,
        };
    setEvents(events.map((e) => (e.id === chipInEvent.id ? updated : e)));
    if (showDetailModal?.id === chipInEvent.id) setShowDetailModal(updated);
    setChipInEvent(null);
    setHubSubmitting(false);
    const apiNote = result.ok ? " Saved to your block hub." : " Saved on this device (start the API to persist).";
    showSuccess(
      `Chipped in $${amount}`,
      `Thank you for supporting ${chipInEvent.title}.${apiNote}`,
      note || undefined
    );
  };

  const handleRsvpSubmit = async ({ going, guestCount, bringing, note }) => {
    if (!rsvpEvent) return;
    setHubSubmitting(true);
    const result = await hubApi.rsvpToEvent(streetId, rsvpEvent.id, { going, guestCount, bringing, note });
    const updated = result.ok && result.data?.event
      ? result.data.event
      : {
          ...rsvpEvent,
          going: !!going,
          attendees: going
            ? rsvpEvent.going
              ? rsvpEvent.attendees
              : rsvpEvent.attendees + (guestCount || 1)
            : Math.max(0, rsvpEvent.attendees - 1),
        };
    setEvents(events.map((e) => (e.id === rsvpEvent.id ? updated : e)));
    if (showDetailModal?.id === rsvpEvent.id) setShowDetailModal(updated);
    setRsvpEvent(null);
    setHubSubmitting(false);
    showSuccess(
      going ? "You're going" : "RSVP updated",
      going
        ? `You're on the list for ${rsvpEvent.title}.${bringing ? ` Bringing: ${bringing}.` : ""}`
        : "You've been removed from the headcount."
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen site-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-200 border-t-party"></div>
      </div>
    );
  }

  // Verification Gate
  if (!isVerified) {
    return (
      <>
        <Helmet>
          <title>Block Hub - Verification Required | BlockParty</title>
        </Helmet>
        <div className="min-h-screen flex flex-col site-surface">
          <Nav />
          <div className="flex-1 flex items-center justify-center px-5 py-12">
            <div className="max-w-md w-full">
              <div className="glass-card p-8 lg:p-10 text-center">
                <div className="mb-6">
                  <div className="hub-icon-mark w-16 h-16 mx-auto">
                    <BrandIcon name="lock" size={32} className="text-indigo-600" />
                  </div>
                </div>

                <h1 className="font-display text-2xl font-bold text-slate-900 mb-3">Block Hub access</h1>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  {isDemo 
                    ? "Explore the full BlockParty experience. Enter the code below to jump in."
                    : <>Exclusively for verified residents of <span className="font-semibold text-party">{street?.name || "this street"}</span>.</>
                  }
                </p>

                {isDemo ? (
                  <div className="rounded-2xl bg-party-pale/80 border border-party/20 p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-slate-800">Demo mode</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Type <span className="font-mono font-medium bg-white px-2 py-0.5 rounded-lg border border-slate-200">DEMO</span> below to explore.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-slate-800">How to get access</p>
                    <ol className="text-sm text-slate-600 mt-2 space-y-1 list-decimal list-inside">
                      <li>Verify your address through your HOA</li>
                      <li>Receive your access code via email</li>
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
                    className="input-party text-center text-lg tracking-wider"
                  />
                  {verifyError && <p className="text-red-600 text-sm">{verifyError}</p>}
                  <button onClick={handleVerify} className="btn-party w-full">
                    {isDemo ? "Explore demo" : "Unlock block hub"}
                  </button>
                  {!isDemo && (
                    <p className="text-xs text-slate-500">
                      Don&apos;t have a code? <Link to="/community" className="text-party hover:underline">Join your block</Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // Main Block Hub
  return (
    <>
      <Helmet>
        <title>{street?.name} Block Hub | BlockParty</title>
      </Helmet>

      <div className="min-h-screen flex flex-col site-surface">
        <Nav />

        {isDemo && (
          <div className="bg-slate-900 text-slate-200 text-center text-xs sm:text-sm py-2.5 px-4 border-b border-slate-700/80">
            <BrandIcon name="block-mark" size={14} className="inline-block text-indigo-300 mr-1.5 align-[-2px]" />
            Preview hub with sample data.{" "}
            <Link to="/register-block" className="text-indigo-300 hover:text-white underline underline-offset-2">
              Register your block
            </Link>
          </div>
        )}

        <HubHeader
          street={street}
          isDemo={isDemo}
          eventCount={events.length}
          boardCount={boardPosts.length}
          neighborCount={neighbors.length}
        />
        <HubTabBar tabs={HUB_TABS} activeId={activeTab} onChange={setActiveTab} />

        <main className="flex-1 w-full max-w-6xl mx-auto px-5 lg:px-8 py-8 lg:py-10">
          {activeTab === "home" && (
            <HubOverview
              events={events}
              boardPosts={boardPosts}
              neighbors={neighbors}
              onTabChange={setActiveTab}
              onPlanParty={() => setShowPartyPlanner(true)}
              onPostBoard={() => {
                setFormError("");
                setShowBoardModal(true);
              }}
              onViewEvent={setShowDetailModal}
              onViewPost={setBoardDetailPost}
            />
          )}

          {activeTab === "events" && (
            <HubEventsPanel
              events={events}
              onPlanParty={() => setShowPartyPlanner(true)}
              onManualEvent={() => {
                setFormError("");
                setShowEventModal(true);
              }}
              onViewDetail={setShowDetailModal}
              onOpenRsvp={setRsvpEvent}
              onOpenChipIn={setChipInEvent}
            />
          )}

          {activeTab === "board" && (
            <HubBoardPanel
              posts={boardPosts}
              onPost={() => {
                setFormError("");
                setShowBoardModal(true);
              }}
              onViewPost={setBoardDetailPost}
              onRespond={openBoardRespond}
              onEndorse={setEndorsePost}
            />
          )}

          {activeTab === "neighbors" && (
            <HubNeighborsPanel
              neighbors={neighbors}
              onOfferSkill={() => setShowNeighborOfferModal(true)}
              onContact={setNeighborContact}
            />
          )}

        </main>

        <PartyPlannerModal
          isOpen={showPartyPlanner}
          onClose={() => setShowPartyPlanner(false)}
          onPublish={handlePublishFromPlanner}
          streetName={street?.name}
          streetId={streetId}
        />

        <HubBoardPostModal
          isOpen={showBoardModal}
          onClose={() => {
            setShowBoardModal(false);
            resetBoardDraft();
            setFormError("");
          }}
          draft={boardDraft}
          onChange={setBoardDraft}
          onSubmit={handleCreateBoardPost}
          submitting={hubSubmitting}
          error={formError}
        />

        <HubChipInModal
          event={chipInEvent}
          isOpen={!!chipInEvent}
          onClose={() => setChipInEvent(null)}
          onSubmit={handleChipInSubmit}
          submitting={hubSubmitting}
        />

        <HubRsvpModal
          event={rsvpEvent}
          isOpen={!!rsvpEvent}
          onClose={() => setRsvpEvent(null)}
          onSubmit={handleRsvpSubmit}
          submitting={hubSubmitting}
        />

        <HubBoardDetailModal
          post={boardDetailPost}
          isOpen={!!boardDetailPost}
          onClose={() => setBoardDetailPost(null)}
          onRespond={openBoardRespond}
          onEndorse={setEndorsePost}
        />

        <HubBoardRespondModal
          post={boardRespond?.post}
          respondType={boardRespond?.type}
          isOpen={!!boardRespond}
          onClose={() => setBoardRespond(null)}
          onSubmit={handleBoardRespondSubmit}
          submitting={hubSubmitting}
        />

        <HubEndorseModal
          post={endorsePost}
          isOpen={!!endorsePost}
          onClose={() => setEndorsePost(null)}
          onSubmit={handleEndorseSubmit}
          submitting={hubSubmitting}
        />

        <HubSuccessModal
          isOpen={!!successModal}
          onClose={() => setSuccessModal(null)}
          title={successModal?.title}
          message={successModal?.message}
          detail={successModal?.detail}
          actionLabel={successModal?.actionLabel}
          onAction={successModal?.onAction}
        />

        <HubNeighborModal
          isOpen={showNeighborOfferModal}
          onClose={() => {
            setShowNeighborOfferModal(false);
            setFormError("");
          }}
          draft={neighborDraft}
          onChange={setNeighborDraft}
          onSubmit={handleCreateNeighborOffer}
          submitting={hubSubmitting}
          error={showNeighborOfferModal ? formError : ""}
        />

        <HubNeighborContactModal
          neighbor={neighborContact}
          onClose={() => setNeighborContact(null)}
        />

        {/* MODALS */}

        {/* New Event Modal */}
        <Modal isOpen={showEventModal} onClose={() => {
          setShowEventModal(false);
          setShowPartnerShops(false);
          setSelectedShop(null);
          setNewEvent({ 
            title: "", date: "", time: "", description: "", type: "party",
            needsFunding: false, fundingGoal: "", fundingDescription: "",
            partnerShopItems: []
          });
        }} title="Post a New Event">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Event Title</label>
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Summer BBQ, Garage Sale, etc." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Time</label>
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Event Type</label>
              <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party">
                <option value="party">Party / gathering</option>
                <option value="sale">Garage sale</option>
                <option value="activity">Activity / sports</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows="3" placeholder="What should neighbors know about this event?"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party" />
            </div>

            {/* Crowdfunding Toggle */}
            <div className="border-t border-stone-200 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newEvent.needsFunding} 
                  onChange={(e) => setNewEvent({...newEvent, needsFunding: e.target.checked})}
                  className="w-5 h-5 rounded border-stone-300 text-party focus:ring-party/50"
                />
                <div>
                  <span className="font-medium text-slate-900">Enable crowdfunding</span>
                  <p className="text-xs text-stone-500">Let neighbors chip in for event supplies, rentals, etc.</p>
                </div>
              </label>
            </div>

            {/* Crowdfunding Fields (shown when enabled) */}
            {newEvent.needsFunding && (
              <div className="bg-warm-100 border border-stone-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Funding Goal ($)</label>
                  <input type="number" value={newEvent.fundingGoal} onChange={(e) => setNewEvent({...newEvent, fundingGoal: e.target.value})}
                    placeholder="200" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">What's the funding for?</label>
                  <input type="text" value={newEvent.fundingDescription} onChange={(e) => setNewEvent({...newEvent, fundingDescription: e.target.value})}
                    placeholder="Bounce house rental, food & drinks, decorations..." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-party/50 focus:border-party" />
                </div>
              </div>
            )}

            {/* Partner Shops Section */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-slate-900">Order pizza for your event</span>
                  <p className="text-xs text-stone-500">Local pizza partners on your block</p>
                </div>
                <button
                  onClick={() => setShowPartnerShops(!showPartnerShops)}
                  className="text-sm text-party hover:text-party-dark font-medium"
                >
                  {showPartnerShops ? "Hide Shops" : "Browse Shops"}
                </button>
              </div>

              {showPartnerShops && (
                <div className="space-y-4">
                  {/* Shop Selection */}
                  {!selectedShop ? (
                    <div className="grid grid-cols-2 gap-3">
                      {pizzaPartnerShops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => setSelectedShop(shop)}
                          className="p-3 border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left flex gap-3 items-start"
                        >
                          <HubIconMark icon="pizza" size="sm" />
                          <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 mb-1">{shop.type}</p>
                          <div className="font-semibold text-sm text-slate-900">{shop.name}</div>
                          <div className="text-xs text-slate-500">{shop.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {/* Back button */}
                      <button
                        onClick={() => setSelectedShop(null)}
                        className="mb-3 text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1"
                      >
                        ← Back to shops
                      </button>

                      {/* Shop items */}
                      <div className="bg-stone-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-3 mb-3">
                          <HubIconMark icon="pizza" />
                          <div>
                            <div className="font-semibold text-slate-900">{selectedShop.name}</div>
                            <div className="text-xs text-stone-500">{selectedShop.description}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedShop.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border border-stone-200 rounded-lg hover:bg-party-pale transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm text-stone-900">{item.name}</div>
                              <div className="text-xs text-stone-500">{item.serves}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-semibold text-stone-900">${item.price.toFixed(2)}</div>
                              </div>
                              <button
                                onClick={() => handleAddShopItem(selectedShop.id, item)}
                                className="px-3 py-1 bg-party text-white text-sm rounded-lg hover:bg-party-dark transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Items Cart */}
                  {newEvent.partnerShopItems.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="font-semibold text-stone-900 mb-2">Selected Items</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {newEvent.partnerShopItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-stone-900">
                                {item.itemName}
                              </div>
                              <div className="text-xs text-stone-500">{item.shopName}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center border border-stone-300 rounded text-stone-600 hover:bg-stone-100"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center border border-stone-300 rounded text-stone-600 hover:bg-stone-100"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm font-semibold text-stone-900 w-16 text-right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                              <button
                                onClick={() => handleRemoveShopItem(index)}
                                className="text-red-500 hover:text-red-700 text-sm ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                        <span className="font-semibold text-stone-900">Total:</span>
                        <span className="text-lg font-bold text-party">${getTotalShopCost().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        Payment will be processed when you confirm the order.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {formError && showEventModal && <p className="text-sm text-red-600">{formError}</p>}
            <button
              type="button"
              onClick={handleCreateEvent}
              disabled={hubSubmitting}
              className="w-full px-4 py-3 bg-party text-white rounded-lg font-semibold hover:bg-party-dark transition-colors disabled:opacity-50"
            >
              {hubSubmitting ? "Posting…" : newEvent.needsFunding ? "Post event with fundraising" : "Post event"}
            </button>
          </div>
        </Modal>

        {/* Event Detail Modal */}
        <Modal isOpen={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={showDetailModal?.title || "Event Details"}>
          {showDetailModal && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <HubCategoryChip
                  icon={getEventTypeIcon(showDetailModal.type)}
                  label={getEventTypeLabel(showDetailModal.type)}
                />
              </div>
              <div className="text-center">
                <p className="text-lg text-slate-600">{showDetailModal.date} at {showDetailModal.time}</p>
                <p className="text-sm text-slate-500 mt-1">Hosted by {formatHouse(showDetailModal.houseNumber)}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-700">{showDetailModal.description}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                <span className="font-semibold text-party">{showDetailModal.attendees}</span> neighbors are going
              </div>

              {/* Partner Shop Items Section */}
              {showDetailModal.partnerShopItems && showDetailModal.partnerShopItems.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <p className="font-semibold text-slate-900 mb-3">Local food order</p>
                  <div className="space-y-2">
                    {showDetailModal.partnerShopItems.map((item, index) => (
                      <div key={index} className="bg-white p-2 rounded border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-900">
                              {item.itemName} × {item.quantity}
                            </div>
                            <div className="text-xs text-stone-500">{item.shopName}</div>
                          </div>
                          <div className="text-sm font-semibold text-stone-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                    <span className="font-semibold text-stone-900">Total:</span>
                    <span className="text-lg font-bold text-party">
                      ${showDetailModal.partnerShopItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    Order will be delivered to the event location.
                  </p>
                </div>
              )}

              {/* Crowdfunding Section in Detail Modal */}
              {showDetailModal.needsFunding && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-slate-900">Event fundraising</span>
                    {showDetailModal.fundingRaised >= showDetailModal.fundingGoal && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">Funded</span>
                    )}
                  </div>
                  {showDetailModal.fundingDescription && (
                    <p className="text-sm text-stone-600 mb-3">{showDetailModal.fundingDescription}</p>
                  )}
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-stone-900">${showDetailModal.fundingRaised || 0} raised</span>
                    <span className="text-stone-500">of ${showDetailModal.fundingGoal} goal</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${showDetailModal.fundingRaised >= showDetailModal.fundingGoal ? "bg-green-500" : "bg-party"}`}
                      style={{ width: `${Math.min((showDetailModal.fundingRaised / showDetailModal.fundingGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 mb-3">{showDetailModal.fundingBackers || 0} neighbors have chipped in</p>
                  
                  {showDetailModal.fundingRaised < showDetailModal.fundingGoal && (
                    <button
                      type="button"
                      onClick={() => setChipInEvent(showDetailModal)}
                      className="w-full mt-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      Chip in
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setRsvpEvent(showDetailModal)}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  showDetailModal.going ? "bg-emerald-100 text-emerald-800" : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {showDetailModal.going ? "Update RSVP" : "RSVP — I'm going"}
              </button>
            </div>
          )}
        </Modal>

        <Footer />
      </div>
    </>
  );
};

export default Community;
