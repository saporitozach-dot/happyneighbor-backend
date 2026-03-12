import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { API_URL } from "../utils/apiConfig";
import FirstResidentCelebration from "../components/FirstResidentCelebration";

// Modal Component - defined outside to prevent re-creation on each render
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
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showContactModal, setShowContactModal] = useState(null);
  const [showListingModal, setShowListingModal] = useState(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInviteApprovalModal, setShowInviteApprovalModal] = useState(false);
  const [managementMenuOpen, setManagementMenuOpen] = useState(false);

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
      icon: "🍕",
      description: "Local favorite for block parties",
      items: [
        { id: 1, name: "Large Cheese Pizza", price: 18.99, serves: "8-10 people", discount: 10 },
        { id: 2, name: "Large Pepperoni Pizza", price: 21.99, serves: "8-10 people" },
        { id: 3, name: "Party Pack (3 Large Pizzas)", price: 52.99, serves: "24-30 people", discount: 15 },
        { id: 4, name: "Breadsticks (12 pieces)", price: 6.99, serves: "6-8 people" },
        { id: 5, name: "Wings (20 pieces)", price: 24.99, serves: "8-10 people", discount: 5 },
      ]
    },
    {
      id: 2,
      name: "Sub Station",
      type: "subs",
      icon: "🥪",
      description: "Fresh subs for any gathering",
      items: [
        { id: 6, name: "Party Sub (6 feet)", price: 89.99, serves: "30-40 people", discount: 12 },
        { id: 7, name: "Party Sub (3 feet)", price: 49.99, serves: "15-20 people" },
        { id: 8, name: "12-inch Sub Platter (6 subs)", price: 45.99, serves: "12-18 people" },
        { id: 9, name: "Wrap Platter (10 wraps)", price: 39.99, serves: "10 people", discount: 8 },
        { id: 10, name: "Salad Platter (large)", price: 34.99, serves: "12-15 people" },
      ]
    },
    {
      id: 3,
      name: "BBQ Express",
      type: "bbq",
      icon: "🍖",
      description: "Catering for neighborhood events",
      items: [
        { id: 11, name: "BBQ Platter (feeds 20)", price: 149.99, serves: "20 people", discount: 20 },
        { id: 12, name: "Pulled Pork (5 lbs)", price: 64.99, serves: "15-20 people" },
        { id: 13, name: "Chicken Wings (50 pieces)", price: 54.99, serves: "15-20 people", discount: 10 },
        { id: 14, name: "Side Dishes Platter", price: 29.99, serves: "12-15 people" },
      ]
    },
    {
      id: 4,
      name: "Sweet Treats Bakery",
      type: "desserts",
      icon: "🍰",
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
      icon: "🥤",
      description: "Drinks for your event",
      items: [
        { id: 19, name: "Soda Pack (48 cans)", price: 24.99, serves: "24-30 people" },
        { id: 20, name: "Water Bottles (48 pack)", price: 19.99, serves: "48 people" },
        { id: 21, name: "Lemonade (5 gallons)", price: 34.99, serves: "40-50 people" },
        { id: 22, name: "Juice Boxes (36 pack)", price: 22.99, serves: "36 people" },
      ]
    }
  ];
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "other", urgency: "low" });
  const [newHelper, setNewHelper] = useState({ title: "", price: "", description: "", availability: "" });
  const [newListing, setNewListing] = useState({ 
    title: "", price: "", description: "", category: "other", condition: "good",
    listingType: "sell", photos: [], photoPreview: null
  });

  // Data states - Events now include optional crowdfunding
  const [events, setEvents] = useState([
    { 
      id: 1, title: "Summer Block Party 🎉", date: "2024-07-15", time: "4:00 PM", houseNumber: "247", 
      description: "Annual summer cookout! Bring a dish to share. We'll have games for kids, a bounce house, and live music from a local band. BYOB but we'll have lemonade and water for everyone!", 
      attendees: 12, type: "party", going: false,
      // Crowdfunding fields
      needsFunding: true, fundingGoal: 300, fundingRaised: 185, fundingBackers: 9,
      fundingDescription: "Bounce house rental, DJ, decorations, and drinks for everyone!"
    },
    { 
      id: 2, title: "Neighborhood Garage Sale", date: "2024-06-22", time: "8:00 AM", houseNumber: "Multiple", 
      description: "Multi-family garage sale spanning 8 houses. Maps available at corner of Oak & Main. Rain date: June 29th.", 
      attendees: 8, type: "sale", going: false,
      needsFunding: false
    },
    { 
      id: 3, title: "Kids Bike Parade 🚲", date: "2024-07-04", time: "10:00 AM", houseNumber: "189", 
      description: "Decorate your bikes and join us for a patriotic parade down the block! We'll end at the park for popsicles. All ages welcome!", 
      attendees: 15, type: "activity", going: false,
      needsFunding: true, fundingGoal: 100, fundingRaised: 100, fundingBackers: 8,
      fundingDescription: "Popsicles and patriotic decorations for all the kids!"
    },
    { 
      id: 4, title: "Holiday Block Party", date: "2024-12-15", time: "5:00 PM", houseNumber: "312", 
      description: "Hot cocoa, caroling, and holiday cheer! Bring your favorite holiday treats to share.", 
      attendees: 6, type: "party", going: false,
      needsFunding: true, fundingGoal: 250, fundingRaised: 85, fundingBackers: 4,
      fundingDescription: "Tents, decorations, hot cocoa station for our annual holiday gathering!"
    },
    { 
      id: 5, title: "Back-to-School Ice Cream Social", date: "2024-08-20", time: "3:00 PM", houseNumber: "423", 
      description: "Welcome families back with an ice cream truck visit! Kids eat free, adults $2 suggested.", 
      attendees: 10, type: "activity", going: false,
      needsFunding: true, fundingGoal: 150, fundingRaised: 75, fundingBackers: 5,
      fundingDescription: "Ice cream truck rental for the neighborhood kids!"
    },
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

  // Marketplace listings
  // Neighborhood hub invites
  const [neighborhoodInvites, setNeighborhoodInvites] = useState([
    // Outgoing invites (initiated by this street)
    {
      id: 1,
      type: "outgoing",
      invitedStreetId: 2,
      invitedStreetName: "Oak Avenue",
      invitedStreetCity: "Springfield",
      invitedStreetState: "IL",
      status: "pending_approval", // pending_approval -> sent -> accepted/rejected
      createdBy: "John D.",
      createdAt: "2024-06-20",
      approvals: 8,
      approvalsNeeded: 5, // Minimum approvals needed
      totalResidents: 15,
      voters: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8"]
    },
  ]);
  const [incomingInvites, setIncomingInvites] = useState([
    // Incoming invites (from other streets)
    {
      id: 2,
      type: "incoming",
      fromStreetId: 3,
      fromStreetName: "Park Boulevard",
      fromStreetCity: "Springfield",
      fromStreetState: "IL",
      status: "pending_approval", // pending_approval -> accepted/rejected
      createdBy: "Jane S.",
      createdAt: "2024-06-18",
      approvals: 3,
      approvalsNeeded: 5,
      totalResidents: 12,
      voters: ["user1", "user2", "user3"],
      message: "Join our neighborhood hub! We'd love to collaborate on events and community activities."
    },
  ]);
  const [inviteSearch, setInviteSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showFirstResidentCelebration, setShowFirstResidentCelebration] = useState(false);
  const [selectedStreetForInvite, setSelectedStreetForInvite] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const searchTimeoutRef = useRef(null);

  const [marketplaceListings, setMarketplaceListings] = useState([
    { 
      id: 1, title: "Vintage Wooden Desk", price: 150, houseNumber: "247", 
      description: "Beautiful solid oak desk from the 1970s. Some wear but very sturdy. Great for home office. Dimensions: 48\" x 24\" x 30\".", 
      category: "furniture", condition: "good", listingType: "sell",
      photos: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400"],
      postedDate: "2024-06-15", interested: 3
    },
    { 
      id: 2, title: "Kids Bike - 20\"", price: 45, houseNumber: "189", 
      description: "Outgrew it! Blue Schwinn, works great. Minor scratches. Comes with training wheels if needed.", 
      category: "sports", condition: "good", listingType: "sell",
      photos: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400"],
      postedDate: "2024-06-18", interested: 5
    },
    { 
      id: 3, title: "Moving Boxes - FREE", price: 0, houseNumber: "312", 
      description: "About 20 assorted moving boxes. Various sizes. First come first served - grab them from the driveway!", 
      category: "free", condition: "used", listingType: "free",
      photos: [],
      postedDate: "2024-06-20", interested: 2
    },
    { 
      id: 4, title: "Lawn Mower", price: 0, houseNumber: "423", 
      description: "Honda self-propelled mower. Looking to borrow a pressure washer in exchange for a weekend. Or $200 to buy.", 
      category: "outdoor", condition: "excellent", listingType: "trade",
      photos: ["https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=400"],
      postedDate: "2024-06-19", interested: 1
    },
    { 
      id: 5, title: "Baby Crib + Mattress", price: 75, houseNumber: "156", 
      description: "Graco crib in excellent condition, barely used. Includes waterproof mattress. Non-smoking home.", 
      category: "baby", condition: "excellent", listingType: "sell",
      photos: ["https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=400"],
      postedDate: "2024-06-21", interested: 4
    },
    { 
      id: 6, title: "Garden Tools Bundle", price: 35, houseNumber: "267", 
      description: "Rake, shovel, hoe, and hand tools. Moving to a condo - don't need them anymore!", 
      category: "outdoor", condition: "good", listingType: "sell",
      photos: [],
      postedDate: "2024-06-17", interested: 2
    },
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
      if (!sessionStorage.getItem(`firstResidentSeen_${streetId}`)) {
        setShowFirstResidentCelebration(true);
      }
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/streets/${streetId}/vibe`);
      if (response.ok) {
        const data = await response.json();
        setStreet(data.street);
        const surveyCount = data.street?.survey_count ?? 0;
        const seenKey = `firstResidentSeen_${streetId}`;
        if (surveyCount === 1 && !sessionStorage.getItem(seenKey)) {
          setShowFirstResidentCelebration(true);
        }
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
    
    // localStorage from CommunityGateway (returning neighbor or doc upload)
    const verifiedStreetId = localStorage.getItem("verifiedStreetId");
    if (verifiedStreetId && parseInt(verifiedStreetId) === parseInt(streetId)) {
      setIsVerified(true);
      return;
    }
    
    const verifiedStreets = JSON.parse(localStorage.getItem("verifiedStreets") || "[]");
    if (verifiedStreets.includes(parseInt(streetId))) {
      setIsVerified(true);
      return;
    }
    
    // Logged-in user: check if their account has verified access to this street
    try {
      const response = await fetch(`${API_URL}/community/has-access/${streetId}`, { credentials: 'include' });
      const data = await response.json();
      if (data.hasAccess) {
        setIsVerified(true);
      }
    } catch (_) {}
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
      shopIcon: shop.icon,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      discount: item.discount || 0,
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
    return newEvent.partnerShopItems.reduce((total, item) => {
      const discountedPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getDiscountedPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return price * (1 - discount / 100);
  };

  // Demo streets for invite search fallback (when API unavailable)
  const DEMO_INVITE_STREETS = [
    { id: 1, name: "Oak Avenue", city: "Boston", state: "MA" },
    { id: 2, name: "Maple Lane", city: "Boston", state: "MA" },
    { id: 3, name: "Cedar Drive", city: "Cambridge", state: "MA" },
    { id: 4, name: "Pine Street", city: "Somerville", state: "MA" },
    { id: 5, name: "Elm Court", city: "Brookline", state: "MA" },
    { id: 6, name: "Park Boulevard", city: "Springfield", state: "IL" },
    { id: 7, name: "Main Street", city: "Springfield", state: "IL" },
    { id: 8, name: "First Avenue", city: "Cambridge", state: "MA" },
  ];

  const handleSearchStreets = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    const q = query.trim().toLowerCase();
    const currentStreetId = parseInt(streetId);
    const invitedIds = neighborhoodInvites.map(inv => inv.invitedStreetId);

    try {
      const params = new URLSearchParams({ q: query });
      if (street?.city) params.set("city", street.city);
      if (street?.state) params.set("state", street.state);
      const response = await fetch(`${API_URL}/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        const streets = (data.streets || []).filter(s => s.id !== currentStreetId && !invitedIds.includes(s.id));
        setSearchResults(streets);
        return;
      }
      throw new Error("Search failed");
    } catch (error) {
      console.error("Error searching streets:", error);
      // Fallback: filter demo streets by name, city, or state
      const fallback = DEMO_INVITE_STREETS.filter(
        s =>
          s.id !== currentStreetId &&
          !invitedIds.includes(s.id) &&
          (s.name.toLowerCase().includes(q) ||
            (s.city && s.city.toLowerCase().includes(q)) ||
            (s.state && s.state.toLowerCase().includes(q)))
      );
      setSearchResults(fallback);
    }
  };

  const handleCreateInvite = () => {
    if (!selectedStreetForInvite) return;
    
    const newInvite = {
      id: Date.now(),
      type: "outgoing",
      invitedStreetId: selectedStreetForInvite.id,
      invitedStreetName: selectedStreetForInvite.name,
      invitedStreetCity: selectedStreetForInvite.city,
      invitedStreetState: selectedStreetForInvite.state,
      status: "pending_approval",
      createdBy: "You", // In real app, use actual user name
      createdAt: new Date().toISOString().split('T')[0],
      approvals: 0,
      approvalsNeeded: 5, // Could be dynamic based on street size
      totalResidents: 15, // Mock data
      voters: [],
      message: inviteMessage
    };
    
    setNeighborhoodInvites([...neighborhoodInvites, newInvite]);
    setSelectedStreetForInvite(null);
    setInviteMessage("");
    setInviteSearch("");
    setSearchResults([]);
    setShowInviteModal(false);
  };

  const handleApproveOutgoingInvite = (inviteId) => {
    const userId = `user_${Date.now()}`; // Mock user ID
    setNeighborhoodInvites(neighborhoodInvites.map(inv => {
      if (inv.id === inviteId && !inv.voters.includes(userId)) {
        const newApprovals = inv.approvals + 1;
        const newStatus = newApprovals >= inv.approvalsNeeded ? "sent" : "pending_approval";
        return {
          ...inv,
          approvals: newApprovals,
          status: newStatus,
          voters: [...inv.voters, userId]
        };
      }
      return inv;
    }));
  };

  const handleApproveIncomingInvite = (inviteId) => {
    const userId = `user_${Date.now()}`; // Mock user ID
    setIncomingInvites(incomingInvites.map(inv => {
      if (inv.id === inviteId && !inv.voters.includes(userId)) {
        const newApprovals = inv.approvals + 1;
        const newStatus = newApprovals >= inv.approvalsNeeded ? "accepted" : "pending_approval";
        return {
          ...inv,
          approvals: newApprovals,
          status: newStatus,
          voters: [...inv.voters, userId]
        };
      }
      return inv;
    }));
  };

  const handleRejectIncomingInvite = (inviteId) => {
    setIncomingInvites(incomingInvites.map(inv => 
      inv.id === inviteId ? { ...inv, status: "rejected" } : inv
    ));
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert("Please fill in title, date, and time");
      return;
    }
    if (newEvent.needsFunding && !newEvent.fundingGoal) {
      alert("Please enter a funding goal amount");
      return;
    }
    const event = {
      id: Date.now(),
      ...newEvent,
      houseNumber: "Your House",
      attendees: 1,
      going: true,
      // Initialize funding if enabled
      fundingGoal: newEvent.needsFunding ? parseInt(newEvent.fundingGoal) : 0,
      fundingRaised: 0,
      fundingBackers: 0
    };
    setEvents([event, ...events]);
    setNewEvent({ title: "", date: "", time: "", description: "", type: "party", needsFunding: false, fundingGoal: "", fundingDescription: "", partnerShopItems: [] });
    setShowPartnerShops(false);
    setSelectedShop(null);
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

  const handleChipIn = (eventId, amount) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        const newRaised = (e.fundingRaised || 0) + amount;
        return {
          ...e,
          fundingRaised: newRaised,
          fundingBackers: (e.fundingBackers || 0) + 1
        };
      }
      return e;
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

  const getMarketplaceIcon = (category) => {
    const icons = { 
      furniture: "🪑", electronics: "📱", sports: "⚽", outdoor: "🌿", 
      baby: "👶", clothing: "👕", books: "📚", free: "🎁", other: "📦" 
    };
    return icons[category] || "📦";
  };

  const getConditionBadge = (condition) => {
    const badges = {
      "new": { text: "New", class: "bg-green-100 text-green-700" },
      "excellent": { text: "Like New", class: "bg-blue-100 text-blue-700" },
      "good": { text: "Good", class: "bg-yellow-100 text-yellow-700" },
      "fair": { text: "Fair", class: "bg-orange-100 text-orange-700" },
      "used": { text: "Used", class: "bg-gray-100 text-gray-700" }
    };
    return badges[condition] || badges["good"];
  };

  const handleCreateListing = () => {
    if (!newListing.title || !newListing.description) {
      alert("Please fill in title and description");
      return;
    }
    if (newListing.listingType === "sell" && !newListing.price) {
      alert("Please enter a price for items you're selling");
      return;
    }
    const listing = {
      id: Date.now(),
      ...newListing,
      price: newListing.listingType === "free" ? 0 : parseInt(newListing.price) || 0,
      houseNumber: "Your House",
      postedDate: new Date().toISOString().split('T')[0],
      interested: 0,
      photos: newListing.photoPreview ? [newListing.photoPreview] : []
    };
    setMarketplaceListings([listing, ...marketplaceListings]);
    setNewListing({ title: "", price: "", description: "", category: "other", condition: "good", listingType: "sell", photos: [], photoPreview: null });
    setShowMarketplaceModal(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewListing({ ...newListing, photoPreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterested = (listingId) => {
    setMarketplaceListings(marketplaceListings.map(l => {
      if (l.id === listingId) {
        return { ...l, interested: l.interested + 1 };
      }
      return l;
    }));
    alert("Great! Walk over to their house to discuss. 🏠");
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
          <nav className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="px-6 sm:px-10">
              <div className="flex justify-between items-center h-14">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
                  <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                    Happy Neighbor
                  </span>
                </Link>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Home</Link>
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

      {showFirstResidentCelebration && (
        <FirstResidentCelebration
          streetName={street?.name}
          streetId={streetId}
          onEnter={() => {
            sessionStorage.setItem(`firstResidentSeen_${streetId}`, "true");
            setShowFirstResidentCelebration(false);
          }}
        />
      )}

      <div className="min-h-screen bg-slate-50">
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
              <div className="flex items-center gap-4">
                {!isDemo && <Link to={`/street/${streetId}`} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Street Profile</Link>}
                <Link to="/submit" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Share Your Street</Link>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Home</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header - Improved Readability */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 backdrop-blur rounded-full text-sm font-medium text-white ${isDemo ? "bg-green-500/30" : "bg-white/20"}`}>
                  {isDemo ? "🎉 Demo Mode" : "✓ Verified Resident"}
                </span>
                {(neighborhoodInvites.some(inv => inv.status === "pending_approval") || incomingInvites.some(inv => inv.status === "pending_approval")) && (
                  <span className="px-3 py-1 bg-orange-600 rounded-full text-sm font-medium text-white animate-pulse">
                    🔔 Pending Invites
                  </span>
                )}
              </div>
              {/* Management Menu Button */}
              {isVerified && (
                <div className="relative">
                  <button
                    onClick={() => setManagementMenuOpen(!managementMenuOpen)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="Street Management"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  {managementMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setManagementMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <button
                          onClick={() => {
                            setShowInviteModal(true);
                            setManagementMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xl">🏘️</span>
                          <div>
                            <div className="font-medium text-gray-900">Invite Local Streets</div>
                            <div className="text-xs text-gray-500">Build a neighborhood hub</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowInviteApprovalModal(true);
                            setManagementMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100"
                        >
                          <span className="text-xl">📋</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              Manage Invites
                              {(neighborhoodInvites.some(inv => inv.status === "pending_approval") || incomingInvites.some(inv => inv.status === "pending_approval")) && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                                  {(neighborhoodInvites.filter(inv => inv.status === "pending_approval").length + incomingInvites.filter(inv => inv.status === "pending_approval").length)}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">Review pending invites</div>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                { id: "events", label: "Events & Fundraising", icon: "📅" },
                { id: "marketplace", label: "Marketplace", icon: "🛒" },
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
                  <h2 className="text-2xl font-bold text-gray-900">Events & Fundraising</h2>
                  <p className="text-gray-500 text-sm mt-1">Block parties, garage sales, and neighborhood fun — with optional crowdfunding!</p>
                </div>
                <button onClick={() => setShowEventModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2">
                  <span>+</span> Post Event
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <span>💡</span>
                  <span>Need funding for your event? Enable crowdfunding when posting to let neighbors chip in for supplies, rentals, and more!</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => {
                  const isFunded = event.needsFunding && event.fundingRaised >= event.fundingGoal;
                  const fundingPercent = event.needsFunding ? Math.min((event.fundingRaised / event.fundingGoal) * 100, 100) : 0;
                  
                  return (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{getEventIcon(event.type)}</span>
                          <div className="flex items-center gap-2">
                            {event.needsFunding && (
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${isFunded ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {isFunded ? "💰 Funded!" : "💰 Raising funds"}
                              </span>
                            )}
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{event.attendees} going</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 {event.date}</span>
                          <span>🕓 {event.time}</span>
                        </div>
                        {event.partnerShopItems && event.partnerShopItems.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <span>🍕</span>
                            <span>Food & drinks ordered</span>
                          </div>
                        )}
                        <p className="text-xs text-orange-600 font-medium mt-3">🏠 Posted by #{event.houseNumber}</p>

                        {/* Crowdfunding Section */}
                        {event.needsFunding && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-semibold text-gray-700">${event.fundingRaised || 0} raised</span>
                              <span className="text-gray-500">of ${event.fundingGoal} goal</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${isFunded ? "bg-green-500" : "bg-orange-500"}`}
                                style={{ width: `${fundingPercent}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">{event.fundingBackers || 0} neighbors chipped in</p>
                            
                            {!isFunded && (
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => handleChipIn(event.id, 5)} className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors">$5</button>
                                <button onClick={() => handleChipIn(event.id, 10)} className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors">$10</button>
                                <button onClick={() => handleChipIn(event.id, 25)} className="flex-1 px-2 py-1.5 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600 transition-colors">$25</button>
                              </div>
                            )}
                          </div>
                        )}
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === "marketplace" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Neighborhood Marketplace</h2>
                  <p className="text-gray-500 text-sm mt-1">Buy, sell, trade, or give away items with your neighbors</p>
                </div>
                <button onClick={() => setShowMarketplaceModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center gap-2">
                  <span>+</span> Post Listing
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {["All", "For Sale", "Free", "Trade"].map((filter) => (
                  <button key={filter} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all whitespace-nowrap">
                    {filter === "Free" && "🎁 "}{filter === "Trade" && "🔄 "}{filter}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceListings.map((listing) => {
                  const conditionBadge = getConditionBadge(listing.condition);
                  
                  return (
                    <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                      {/* Photo */}
                      <div className="relative h-48 bg-gray-100">
                        {listing.photos && listing.photos.length > 0 ? (
                          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                            {getMarketplaceIcon(listing.category)}
                          </div>
                        )}
                        {/* Listing Type Badge */}
                        <div className="absolute top-3 left-3">
                          {listing.listingType === "free" && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">FREE</span>
                          )}
                          {listing.listingType === "trade" && (
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">🔄 TRADE</span>
                          )}
                        </div>
                        {/* Condition Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${conditionBadge.class}`}>
                            {conditionBadge.text}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{listing.title}</h3>
                          {listing.listingType === "sell" && (
                            <span className="text-lg font-bold text-orange-600">${listing.price}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{listing.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>🏠 House #{listing.houseNumber}</span>
                          <span>{listing.interested} interested</span>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowListingModal(listing)}
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleInterested(listing.id)}
                            className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                          >
                            I'm Interested
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

            {/* Crowdfunding Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newEvent.needsFunding} 
                  onChange={(e) => setNewEvent({...newEvent, needsFunding: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">💰 Enable Crowdfunding</span>
                  <p className="text-xs text-gray-500">Let neighbors chip in for event supplies, rentals, etc.</p>
                </div>
              </label>
            </div>

            {/* Crowdfunding Fields (shown when enabled) */}
            {newEvent.needsFunding && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funding Goal ($)</label>
                  <input type="number" value={newEvent.fundingGoal} onChange={(e) => setNewEvent({...newEvent, fundingGoal: e.target.value})}
                    placeholder="200" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What's the funding for?</label>
                  <input type="text" value={newEvent.fundingDescription} onChange={(e) => setNewEvent({...newEvent, fundingDescription: e.target.value})}
                    placeholder="Bounce house rental, food & drinks, decorations..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
            )}

            {/* Partner Shops Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-gray-900">🍕 Order from Partner Shops</span>
                  <p className="text-xs text-gray-500">One-click food & drinks for your event</p>
                </div>
                <button
                  onClick={() => setShowPartnerShops(!showPartnerShops)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {showPartnerShops ? "Hide Shops" : "Browse Shops"}
                </button>
              </div>

              {showPartnerShops && (
                <div className="space-y-4">
                  {/* Shop Selection */}
                  {!selectedShop ? (
                    <div className="grid grid-cols-2 gap-3">
                      {partnerShops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => setSelectedShop(shop)}
                          className="p-3 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                        >
                          <div className="text-2xl mb-1">{shop.icon}</div>
                          <div className="font-semibold text-sm text-gray-900">{shop.name}</div>
                          <div className="text-xs text-gray-500">{shop.description}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {/* Back button */}
                      <button
                        onClick={() => setSelectedShop(null)}
                        className="mb-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        ← Back to shops
                      </button>

                      {/* Shop items */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{selectedShop.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{selectedShop.name}</div>
                            <div className="text-xs text-gray-500">{selectedShop.description}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedShop.items.map((item) => {
                          const hasDiscount = item.discount && item.discount > 0;
                          const discountedPrice = hasDiscount ? getDiscountedPrice(item.price, item.discount) : item.price;
                          
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                hasDiscount ? "border-orange-300 bg-orange-50 hover:bg-orange-100" : "border-gray-200 hover:bg-orange-50"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-sm text-gray-900">{item.name}</div>
                                  {hasDiscount && (
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                                      {item.discount}% OFF
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{item.serves}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  {hasDiscount ? (
                                    <>
                                      <div className="text-xs text-gray-400 line-through">${item.price.toFixed(2)}</div>
                                      <div className="font-semibold text-orange-600">${discountedPrice.toFixed(2)}</div>
                                    </>
                                  ) : (
                                    <div className="font-semibold text-gray-900">${item.price.toFixed(2)}</div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleAddShopItem(selectedShop.id, item)}
                                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Items Cart */}
                  {newEvent.partnerShopItems.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="font-semibold text-gray-900 mb-2">Selected Items</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {newEvent.partnerShopItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {item.shopIcon} {item.itemName}
                              </div>
                              <div className="text-xs text-gray-500">{item.shopName}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm font-semibold text-gray-900 w-20 text-right">
                                {item.discount && item.discount > 0 ? (
                                  <>
                                    <div className="text-xs text-gray-400 line-through">${(item.price * item.quantity).toFixed(2)}</div>
                                    <div className="text-orange-600">${(getDiscountedPrice(item.price, item.discount) * item.quantity).toFixed(2)}</div>
                                  </>
                                ) : (
                                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                                )}
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
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-orange-600">${getTotalShopCost().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💳 Payment will be processed when you confirm the order
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleCreateEvent} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              {newEvent.needsFunding ? "Post Event with Fundraising" : "Post Event"}
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

        {/* New Marketplace Listing Modal */}
        <Modal isOpen={showMarketplaceModal} onClose={() => setShowMarketplaceModal(false)} title="Post a Listing">
          <div className="space-y-4">
            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you doing?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "sell", label: "Selling", icon: "💵" },
                  { value: "free", label: "Giving Away", icon: "🎁" },
                  { value: "trade", label: "Trading", icon: "🔄" }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNewListing({...newListing, listingType: type.value})}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                      newListing.listingType === type.value 
                        ? "border-orange-500 bg-orange-50 text-orange-700" 
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span> {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
              <input type="text" value={newListing.title} onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                placeholder="What are you selling/giving away?" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>

            {/* Price - only show for selling */}
            {newListing.listingType === "sell" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" value={newListing.price} onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            )}

            {/* Trade description */}
            {newListing.listingType === "trade" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                🔄 Describe what you're looking for in trade in the description below
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={newListing.category} onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="furniture">🪑 Furniture</option>
                  <option value="electronics">📱 Electronics</option>
                  <option value="sports">⚽ Sports & Outdoors</option>
                  <option value="outdoor">🌿 Garden & Outdoor</option>
                  <option value="baby">👶 Baby & Kids</option>
                  <option value="clothing">👕 Clothing</option>
                  <option value="books">📚 Books & Media</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select value={newListing.condition} onChange={(e) => setNewListing({...newListing, condition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="new">New (unopened)</option>
                  <option value="excellent">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={newListing.description} onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                rows="3" placeholder="Describe the item, dimensions, any flaws, pickup details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
              <div className="flex items-center gap-4">
                {newListing.photoPreview ? (
                  <div className="relative">
                    <img src={newListing.photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                    <button 
                      type="button"
                      onClick={() => setNewListing({...newListing, photoPreview: null})}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                    <span className="text-2xl text-gray-400">📷</span>
                    <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
                <p className="text-xs text-gray-500 flex-1">Add a photo to help neighbors see what you're offering</p>
              </div>
            </div>

            <button onClick={handleCreateListing} className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              {newListing.listingType === "sell" ? `Post for $${newListing.price || '0'}` : 
               newListing.listingType === "free" ? "Post Free Item" : "Post Trade Listing"}
            </button>
          </div>
        </Modal>

        {/* Listing Detail Modal */}
        <Modal isOpen={!!showListingModal} onClose={() => setShowListingModal(null)} title={showListingModal?.title || "Listing Details"}>
          {showListingModal && (
            <div className="space-y-4">
              {/* Photo */}
              {showListingModal.photos && showListingModal.photos.length > 0 ? (
                <img src={showListingModal.photos[0]} alt={showListingModal.title} className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-6xl text-gray-300">
                  {getMarketplaceIcon(showListingModal.category)}
                </div>
              )}

              {/* Price & Type */}
              <div className="flex items-center justify-between">
                {showListingModal.listingType === "sell" && (
                  <span className="text-3xl font-bold text-orange-600">${showListingModal.price}</span>
                )}
                {showListingModal.listingType === "free" && (
                  <span className="text-2xl font-bold text-green-600">🎁 FREE</span>
                )}
                {showListingModal.listingType === "trade" && (
                  <span className="text-2xl font-bold text-purple-600">🔄 Trade</span>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionBadge(showListingModal.condition).class}`}>
                  {getConditionBadge(showListingModal.condition).text}
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{showListingModal.description}</p>
              </div>

              {/* Posted Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>🏠 House #{showListingModal.houseNumber}</span>
                <span>Posted {showListingModal.postedDate}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-semibold text-orange-600">{showListingModal.interested}</span> neighbors interested
              </div>

              {/* Action */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium">🏠 Walk over to House #{showListingModal.houseNumber}</p>
                <p className="text-sm text-orange-700 mt-2">Knock on their door or leave a note to discuss the item!</p>
              </div>

              <button 
                onClick={() => { handleInterested(showListingModal.id); setShowListingModal(null); }}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                I'm Interested!
              </button>
            </div>
          )}
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

              {/* Partner Shop Items Section */}
              {showDetailModal.partnerShopItems && showDetailModal.partnerShopItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🍕</span>
                    <span className="font-semibold text-gray-900">Ordered from Partner Shops</span>
                  </div>
                  <div className="space-y-2">
                    {showDetailModal.partnerShopItems.map((item, index) => (
                      <div key={index} className="bg-white p-2 rounded border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {item.shopIcon} {item.itemName} × {item.quantity}
                            </div>
                            <div className="text-xs text-gray-500">{item.shopName}</div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.discount && item.discount > 0 ? (
                              <>
                                <div className="text-xs text-gray-400 line-through">${(item.price * item.quantity).toFixed(2)}</div>
                                <div className="text-orange-600">${(getDiscountedPrice(item.price, item.discount) * item.quantity).toFixed(2)}</div>
                              </>
                            ) : (
                              <div>${(item.price * item.quantity).toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-orange-600">
                      ${showDetailModal.partnerShopItems.reduce((total, item) => {
                        const discountedPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                        return total + (discountedPrice * item.quantity);
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💳 Order will be delivered to the event location
                  </p>
                </div>
              )}

              {/* Crowdfunding Section in Detail Modal */}
              {showDetailModal.needsFunding && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💰</span>
                    <span className="font-semibold text-gray-900">Event Fundraising</span>
                    {showDetailModal.fundingRaised >= showDetailModal.fundingGoal && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ Funded!</span>
                    )}
                  </div>
                  {showDetailModal.fundingDescription && (
                    <p className="text-sm text-gray-600 mb-3">{showDetailModal.fundingDescription}</p>
                  )}
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-900">${showDetailModal.fundingRaised || 0} raised</span>
                    <span className="text-gray-500">of ${showDetailModal.fundingGoal} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${showDetailModal.fundingRaised >= showDetailModal.fundingGoal ? "bg-green-500" : "bg-orange-500"}`}
                      style={{ width: `${Math.min((showDetailModal.fundingRaised / showDetailModal.fundingGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{showDetailModal.fundingBackers || 0} neighbors have chipped in</p>
                  
                  {showDetailModal.fundingRaised < showDetailModal.fundingGoal && (
                    <div className="flex gap-2">
                      <button onClick={() => { handleChipIn(showDetailModal.id, 5); }} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">$5</button>
                      <button onClick={() => { handleChipIn(showDetailModal.id, 10); }} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">$10</button>
                      <button onClick={() => { handleChipIn(showDetailModal.id, 25); }} className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors">$25</button>
                      <button onClick={() => { handleChipIn(showDetailModal.id, 50); }} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">$50</button>
                    </div>
                  )}
                </div>
              )}

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

        {/* Invite Street to Neighborhood Hub Modal */}
        <Modal isOpen={showInviteModal} onClose={() => {
          setShowInviteModal(false);
          setInviteSearch("");
          setSearchResults([]);
          setSelectedStreetForInvite(null);
          setInviteMessage("");
        }} title="Invite Street to Neighborhood Hub">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>🏘️ Build a Neighborhood Hub</strong><br/>
                Invite nearby streets to create a larger community network. Collaborate on events, share resources, and build stronger neighborhood connections.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search for a Street</label>
              <input
                type="text"
                value={inviteSearch}
                onChange={(e) => {
                  setInviteSearch(e.target.value);
                  // Debounce search
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  searchTimeoutRef.current = setTimeout(() => {
                    handleSearchStreets(e.target.value);
                  }, 300);
                }}
                placeholder="Type street name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((street) => (
                    <button
                      key={street.id}
                      onClick={() => {
                        setSelectedStreetForInvite(street);
                        setInviteSearch(street.name);
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{street.name}</div>
                      <div className="text-sm text-gray-500">{street.city}, {street.state}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedStreetForInvite && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">✓ {selectedStreetForInvite.name}</div>
                      <div className="text-sm text-gray-500">{selectedStreetForInvite.city}, {selectedStreetForInvite.state}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStreetForInvite(null);
                        setInviteSearch("");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personal message to your invitation..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>📋 Approval Process:</strong><br/>
                After creating this invite, your street residents will need to approve it ({selectedStreetForInvite ? "5" : "..."} approvals needed). 
                Once approved, the invite will be sent to {selectedStreetForInvite?.name || "the selected street"}, 
                and their residents will also need to approve before the neighborhood hub is created.
              </p>
            </div>

            <button
              onClick={handleCreateInvite}
              disabled={!selectedStreetForInvite}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Invite
            </button>
          </div>
        </Modal>

        {/* Invite Approval/Management Modal */}
        <Modal isOpen={showInviteApprovalModal} onClose={() => setShowInviteApprovalModal(false)} title="Manage Neighborhood Hub Invites">
          <div className="space-y-6">
            {/* Outgoing Invites */}
            {neighborhoodInvites.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📤</span>
                  Invites We Sent
                </h3>
                <div className="space-y-3">
                  {neighborhoodInvites.map((invite) => (
                    <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{invite.invitedStreetName}</div>
                          <div className="text-sm text-gray-500">{invite.invitedStreetCity}, {invite.invitedStreetState}</div>
                          {invite.message && (
                            <div className="text-sm text-gray-600 mt-2 italic">"{invite.message}"</div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invite.status === "sent" ? "bg-blue-100 text-blue-700" :
                          invite.status === "accepted" ? "bg-green-100 text-green-700" :
                          invite.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {invite.status === "sent" ? "✅ Sent" :
                           invite.status === "accepted" ? "✅ Accepted" :
                           invite.status === "rejected" ? "❌ Rejected" :
                           "⏳ Pending Approval"}
                        </span>
                      </div>
                      {invite.status === "pending_approval" && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Approvals: <strong>{invite.approvals}</strong> / {invite.approvalsNeeded} needed
                            </span>
                            <button
                              onClick={() => handleApproveOutgoingInvite(invite.id)}
                              className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              ✓ Approve
                            </button>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${(invite.approvals / invite.approvalsNeeded) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Created by {invite.createdBy} on {invite.createdAt}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming Invites */}
            {incomingInvites.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📥</span>
                  Invites We Received
                </h3>
                <div className="space-y-3">
                  {incomingInvites.map((invite) => (
                    <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{invite.fromStreetName}</div>
                          <div className="text-sm text-gray-500">{invite.fromStreetCity}, {invite.fromStreetState}</div>
                          {invite.message && (
                            <div className="text-sm text-gray-600 mt-2 italic">"{invite.message}"</div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invite.status === "accepted" ? "bg-green-100 text-green-700" :
                          invite.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {invite.status === "accepted" ? "✅ Accepted" :
                           invite.status === "rejected" ? "❌ Rejected" :
                           "⏳ Pending Approval"}
                        </span>
                      </div>
                      {invite.status === "pending_approval" && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Approvals: <strong>{invite.approvals}</strong> / {invite.approvalsNeeded} needed
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveIncomingInvite(invite.id)}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleRejectIncomingInvite(invite.id)}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${(invite.approvals / invite.approvalsNeeded) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">From {invite.createdBy} on {invite.createdAt}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {neighborhoodInvites.length === 0 && incomingInvites.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🏘️</div>
                <p className="text-gray-600">No invites yet. Invite a local street to get started!</p>
              </div>
            )}

            <button
              onClick={() => {
                setShowInviteApprovalModal(false);
                setShowInviteModal(true);
              }}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              + Invite Another Street
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Community;
