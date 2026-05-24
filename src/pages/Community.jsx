import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "https://happyneighbor-api-production.up.railway.app/api";

// Modal Component - defined outside to prevent re-creation on each render
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white border border-stone-200 shadow-card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl font-semibold text-stone-900">{title}</h3>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
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
      icon: "🥪",
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
      icon: "🍖",
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
      shopIcon: shop.icon,
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
      "fair": { text: "Fair", class: "bg-stone-100 text-stone-700" },
      "used": { text: "Used", class: "bg-stone-100 text-stone-700" }
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
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-200 border-t-leaf"></div>
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
        <div className="min-h-screen flex flex-col bg-warm-50">
          <Nav />
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full">
              <div className="bg-white border border-stone-200 shadow-card p-8 md:p-10 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-leaf-pale border border-leaf/20">
                    <svg className="w-8 h-8 text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-3">Community Hub Access</h1>
                <p className="text-stone-600 mb-6">
                  {isDemo 
                    ? "This is a demo of the Community Hub. Enter the code below to explore!"
                    : <>Exclusively for verified residents of <span className="font-semibold text-leaf">{street?.name || "this street"}</span>.</>
                  }
                </p>

                {isDemo ? (
                  <div className="bg-leaf-pale border border-leaf/30 p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-stone-800">Demo mode</p>
                    <p className="text-sm text-stone-600 mt-2">
                      Type <span className="font-mono font-medium bg-white px-2 py-0.5 border border-stone-200">DEMO</span> below to explore the Community Hub.
                    </p>
                  </div>
                ) : (
                  <div className="bg-warm-100 border border-stone-200 p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-stone-800">How to get access:</p>
                    <ol className="text-sm text-stone-600 mt-2 space-y-1 list-decimal list-inside">
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
                    className="w-full px-4 py-3 border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-leaf/40 focus:border-leaf text-center text-lg tracking-wider"
                  />
                  {verifyError && <p className="text-red-600 text-sm">{verifyError}</p>}
                  <button onClick={handleVerify} className="w-full px-6 py-3 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors">
                    {isDemo ? "Explore Demo" : "Unlock Community Hub"}
                  </button>
                  {!isDemo && (
                    <p className="text-xs text-stone-500">
                      Don&apos;t have a code? <Link to="/community" className="text-leaf hover:underline">Join your community</Link>
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

  // Main Community Hub
  return (
    <>
      <Helmet>
        <title>{street?.name} Community Hub | Happy Neighbor</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-warm-50">
        <Nav />

        {/* Header */}
        <div className="border-b border-stone-200 bg-white">
          <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-8">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider ${isDemo ? "bg-leaf-pale text-leaf border border-leaf/30" : "bg-stone-100 text-stone-600 border border-stone-200"}`}>
                {isDemo ? "Demo" : "Verified resident"}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-stone-900 mb-1">{street?.name} Community Hub</h1>
            <p className="text-stone-600">{street?.city}, {street?.state}</p>
            <p className="text-stone-500 text-sm mt-4 max-w-xl">
              Posts show house numbers only — walk over and say hi.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-stone-200 sticky top-14 z-40">
          <div className="w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16">
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
                  className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-leaf text-leaf"
                      : "border-transparent text-stone-600 hover:text-leaf hover:border-stone-200"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-8">
          
          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-stone-900">Events & Fundraising</h2>
                  <p className="text-stone-500 text-sm mt-1">Block parties, garage sales, and neighborhood fun — with optional crowdfunding!</p>
                </div>
                <button onClick={() => setShowEventModal(true)} className="px-4 py-2 bg-leaf text-white rounded-lg font-medium hover:bg-leaf-dark transition-all flex items-center gap-2">
                  <span>+</span> Post Event
                </button>
              </div>

              <div className="bg-warm-100 border border-stone-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-stone-700 flex items-center gap-2">
                  <span>💡</span>
                  <span>Need funding for your event? Enable crowdfunding when posting to let neighbors chip in for supplies, rentals, and more!</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => {
                  const isFunded = event.needsFunding && event.fundingRaised >= event.fundingGoal;
                  const fundingPercent = event.needsFunding ? Math.min((event.fundingRaised / event.fundingGoal) * 100, 100) : 0;
                  
                  return (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{getEventIcon(event.type)}</span>
                          <div className="flex items-center gap-2">
                            {event.needsFunding && (
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${isFunded ? "bg-green-100 text-green-700" : "bg-warm-100 text-stone-700"}`}>
                                {isFunded ? "💰 Funded!" : "💰 Raising funds"}
                              </span>
                            )}
                            <span className="text-xs font-medium text-leaf bg-leaf-pale px-2 py-1 rounded-full">{event.attendees} going</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-stone-900 text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-stone-500">
                          <span>📅 {event.date}</span>
                          <span>🕓 {event.time}</span>
                        </div>
                        {event.partnerShopItems && event.partnerShopItems.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <span>🍕</span>
                            <span>Food & drinks ordered</span>
                          </div>
                        )}
                        <p className="text-xs text-leaf font-medium mt-3">🏠 Posted by #{event.houseNumber}</p>

                        {/* Crowdfunding Section */}
                        {event.needsFunding && (
                          <div className="mt-4 pt-4 border-t border-stone-100">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-semibold text-stone-700">${event.fundingRaised || 0} raised</span>
                              <span className="text-stone-500">of ${event.fundingGoal} goal</span>
                            </div>
                            <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${isFunded ? "bg-green-500" : "bg-leaf"}`}
                                style={{ width: `${fundingPercent}%` }}
                              />
                            </div>
                            <p className="text-xs text-stone-500">{event.fundingBackers || 0} neighbors chipped in</p>
                            
                            {!isFunded && (
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => handleChipIn(event.id, 5)} className="flex-1 px-2 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs hover:bg-stone-200 transition-colors">$5</button>
                                <button onClick={() => handleChipIn(event.id, 10)} className="flex-1 px-2 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs hover:bg-stone-200 transition-colors">$10</button>
                                <button onClick={() => handleChipIn(event.id, 25)} className="flex-1 px-2 py-1.5 bg-leaf text-white rounded-lg text-xs hover:bg-leaf-dark transition-colors">$25</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="bg-stone-50 px-5 py-3 flex justify-between items-center border-t border-stone-100">
                        <button onClick={() => setShowDetailModal(event)} className="text-leaf font-medium text-sm hover:underline">View Details</button>
                        <button 
                          onClick={() => handleGoingToggle(event.id)}
                          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                            event.going ? "bg-green-100 text-green-700" : "bg-leaf text-white hover:bg-leaf-dark"
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
                  <h2 className="font-serif text-2xl font-semibold text-stone-900">Neighborhood Marketplace</h2>
                  <p className="text-stone-500 text-sm mt-1">Buy, sell, trade, or give away items with your neighbors</p>
                </div>
                <button onClick={() => setShowMarketplaceModal(true)} className="px-4 py-2 bg-leaf text-white rounded-lg font-medium hover:bg-leaf-dark transition-all flex items-center gap-2">
                  <span>+</span> Post Listing
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {["All", "For Sale", "Free", "Trade"].map((filter) => (
                  <button key={filter} className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:bg-leaf-pale hover:border-stone-400 hover:text-leaf transition-all whitespace-nowrap">
                    {filter === "Free" && "🎁 "}{filter === "Trade" && "🔄 "}{filter}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceListings.map((listing) => {
                  const conditionBadge = getConditionBadge(listing.condition);
                  
                  return (
                    <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                      {/* Photo */}
                      <div className="relative h-48 bg-stone-100">
                        {listing.photos && listing.photos.length > 0 ? (
                          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl text-stone-300">
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
                          <h3 className="font-bold text-stone-900">{listing.title}</h3>
                          {listing.listingType === "sell" && (
                            <span className="text-lg font-bold text-leaf">${listing.price}</span>
                          )}
                        </div>
                        <p className="text-sm text-stone-600 mb-3 line-clamp-2 flex-1">{listing.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                          <span>🏠 House #{listing.houseNumber}</span>
                          <span>{listing.interested} interested</span>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowListingModal(listing)}
                            className="flex-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleInterested(listing.id)}
                            className="flex-1 px-3 py-2 bg-leaf text-white rounded-lg text-sm font-medium hover:bg-leaf-dark transition-colors"
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
                  <h2 className="font-serif text-2xl font-semibold text-stone-900">Neighbor Task Board</h2>
                  <p className="text-stone-500 text-sm mt-1">Need a hand? Ask your neighbors!</p>
                </div>
                <button onClick={() => setShowTaskModal(true)} className="px-4 py-2 bg-leaf text-white rounded-lg font-medium hover:bg-leaf-dark transition-all flex items-center gap-2">
                  <span>+</span> Request Help
                </button>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getCategoryIcon(task.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-stone-900 text-lg">{task.title}</h3>
                            <p className="text-xs text-leaf font-medium">🏠 House #{task.houseNumber}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.urgency === "high" ? "bg-red-100 text-red-700" :
                            task.urgency === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {task.urgency} priority
                          </span>
                        </div>
                        <p className="text-stone-600 mt-2">{task.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-leaf font-medium">{task.offers} neighbor{task.offers !== 1 && "s"} offered to help</span>
                          <button onClick={() => handleOfferHelp(task.id)} className="px-4 py-2 bg-leaf text-white rounded-lg font-medium hover:bg-leaf-dark transition-colors text-sm">
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
                  <h2 className="font-serif text-2xl font-semibold text-stone-900">Local Helpers</h2>
                  <p className="text-stone-500 text-sm mt-1">Trusted services from your neighbors</p>
                </div>
                <button onClick={() => setShowHelperModal(true)} className="px-4 py-2 bg-leaf text-white rounded-lg font-medium hover:bg-leaf-dark transition-all flex items-center gap-2">
                  <span>+</span> List Your Service
                </button>
              </div>

              <div className="bg-leaf-pale border border-leaf/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💼</span>
                  <div>
                    <p className="font-semibold text-stone-900">Become a Local Helper</p>
                    <p className="text-sm text-stone-600 mt-1">List your services for just <strong className="text-leaf">$5/month</strong>. Help neighbors & earn extra income!</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {localHelpers.map((helper) => (
                  <div key={helper.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{getServiceIcon(helper.title)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-stone-900 text-lg">{helper.title}</h3>
                            <p className="text-xs text-leaf font-medium">🏠 House #{helper.houseNumber}</p>
                          </div>
                          <span className="text-lg font-bold text-leaf">{helper.price}</span>
                        </div>
                        <p className="text-stone-600 mt-2 text-sm">{helper.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1 text-stone-600">⭐ {helper.rating}</span>
                          <span className="text-stone-400">({helper.reviews} reviews)</span>
                          <span className="text-stone-500">{helper.availability}</span>
                        </div>
                        <button 
                          onClick={() => setShowContactModal(helper)}
                          className="mt-4 w-full px-4 py-2 bg-leaf text-white rounded-lg font-medium hover:bg-leaf-dark transition-colors text-sm"
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
        </main>

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
                placeholder="Summer BBQ, Garage Sale, etc." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Time</label>
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Event Type</label>
              <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf">
                <option value="party">🎉 Party / Gathering</option>
                <option value="sale">🏷️ Garage Sale</option>
                <option value="activity">🎯 Activity / Sports</option>
                <option value="meeting">📋 Meeting</option>
                <option value="other">📅 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows="3" placeholder="What should neighbors know about this event?"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>

            {/* Crowdfunding Toggle */}
            <div className="border-t border-stone-200 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newEvent.needsFunding} 
                  onChange={(e) => setNewEvent({...newEvent, needsFunding: e.target.checked})}
                  className="w-5 h-5 rounded border-stone-300 text-leaf focus:ring-leaf/40"
                />
                <div>
                  <span className="font-medium text-stone-900">💰 Enable Crowdfunding</span>
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
                    placeholder="200" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">What's the funding for?</label>
                  <input type="text" value={newEvent.fundingDescription} onChange={(e) => setNewEvent({...newEvent, fundingDescription: e.target.value})}
                    placeholder="Bounce house rental, food & drinks, decorations..." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
                </div>
              </div>
            )}

            {/* Partner Shops Section */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-stone-900">🍕 Order from Partner Shops</span>
                  <p className="text-xs text-stone-500">One-click food & drinks for your event</p>
                </div>
                <button
                  onClick={() => setShowPartnerShops(!showPartnerShops)}
                  className="text-sm text-leaf hover:text-leaf-dark font-medium"
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
                          className="p-3 border-2 border-stone-200 rounded-lg hover:border-leaf hover:bg-leaf-pale transition-all text-left"
                        >
                          <div className="text-2xl mb-1">{shop.icon}</div>
                          <div className="font-semibold text-sm text-stone-900">{shop.name}</div>
                          <div className="text-xs text-stone-500">{shop.description}</div>
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
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{selectedShop.icon}</span>
                          <div>
                            <div className="font-semibold text-stone-900">{selectedShop.name}</div>
                            <div className="text-xs text-stone-500">{selectedShop.description}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedShop.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border border-stone-200 rounded-lg hover:bg-leaf-pale transition-colors"
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
                                className="px-3 py-1 bg-leaf text-white text-sm rounded-lg hover:bg-leaf-dark transition-colors"
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
                                {item.shopIcon} {item.itemName}
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
                        <span className="text-lg font-bold text-leaf">${getTotalShopCost().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        💳 Payment will be processed when you confirm the order
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleCreateEvent} className="w-full px-4 py-3 bg-leaf text-white rounded-lg font-semibold hover:bg-leaf-dark transition-colors">
              {newEvent.needsFunding ? "Post Event with Fundraising" : "Post Event"}
            </button>
          </div>
        </Modal>

        {/* New Task Modal */}
        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Request Help">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">What do you need help with?</label>
              <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Quick lawn mow, tech help, pet sitting..." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf">
                  <option value="tech">💻 Tech Help</option>
                  <option value="yard">🌿 Yard Work</option>
                  <option value="pets">🐾 Pet Care</option>
                  <option value="moving">📦 Moving Help</option>
                  <option value="errands">🏃 Errands</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Priority</label>
                <select value={newTask.urgency} onChange={(e) => setNewTask({...newTask, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf">
                  <option value="low">Low - Whenever</option>
                  <option value="medium">Medium - This Week</option>
                  <option value="high">High - ASAP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Details</label>
              <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                rows="3" placeholder="Describe what you need, when, and any other details..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>
            <button onClick={handleCreateTask} className="w-full px-4 py-3 bg-leaf text-white rounded-lg font-semibold hover:bg-leaf-dark transition-colors">
              Post Request
            </button>
          </div>
        </Modal>

        {/* New Marketplace Listing Modal */}
        <Modal isOpen={showMarketplaceModal} onClose={() => setShowMarketplaceModal(false)} title="Post a Listing">
          <div className="space-y-4">
            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">What are you doing?</label>
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
                        ? "border-leaf bg-leaf-pale text-stone-700" 
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span> {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Item Title</label>
              <input type="text" value={newListing.title} onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                placeholder="What are you selling/giving away?" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>

            {/* Price - only show for selling */}
            {newListing.listingType === "sell" && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
                <input type="number" value={newListing.price} onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  placeholder="0" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select value={newListing.category} onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Condition</label>
                <select value={newListing.condition} onChange={(e) => setNewListing({...newListing, condition: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf">
                  <option value="new">New (unopened)</option>
                  <option value="excellent">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={newListing.description} onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                rows="3" placeholder="Describe the item, dimensions, any flaws, pickup details..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Photo (optional)</label>
              <div className="flex items-center gap-4">
                {newListing.photoPreview ? (
                  <div className="relative">
                    <img src={newListing.photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-stone-200" />
                    <button 
                      type="button"
                      onClick={() => setNewListing({...newListing, photoPreview: null})}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-leaf hover:bg-leaf-pale transition-colors">
                    <span className="text-2xl text-stone-400">📷</span>
                    <span className="text-xs text-stone-500 mt-1">Add Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
                <p className="text-xs text-stone-500 flex-1">Add a photo to help neighbors see what you're offering</p>
              </div>
            </div>

            <button onClick={handleCreateListing} className="w-full px-4 py-3 bg-leaf text-white rounded-lg font-semibold hover:bg-leaf-dark transition-colors">
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
                <div className="w-full h-48 bg-stone-100 rounded-lg flex items-center justify-center text-6xl text-stone-300">
                  {getMarketplaceIcon(showListingModal.category)}
                </div>
              )}

              {/* Price & Type */}
              <div className="flex items-center justify-between">
                {showListingModal.listingType === "sell" && (
                  <span className="text-3xl font-bold text-leaf">${showListingModal.price}</span>
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
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-700">{showListingModal.description}</p>
              </div>

              {/* Posted Info */}
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>🏠 House #{showListingModal.houseNumber}</span>
                <span>Posted {showListingModal.postedDate}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span className="font-semibold text-leaf">{showListingModal.interested}</span> neighbors interested
              </div>

              {/* Action */}
              <div className="bg-leaf-pale border border-leaf/30 rounded-lg p-4">
                <p className="text-stone-800 font-medium">🏠 Walk over to House #{showListingModal.houseNumber}</p>
                <p className="text-sm text-stone-700 mt-2">Knock on their door or leave a note to discuss the item!</p>
              </div>

              <button 
                onClick={() => { handleInterested(showListingModal.id); setShowListingModal(null); }}
                className="w-full px-4 py-3 bg-leaf text-white rounded-lg font-semibold hover:bg-leaf-dark transition-colors"
              >
                I'm Interested!
              </button>
            </div>
          )}
        </Modal>

        {/* New Helper Service Modal */}
        <Modal isOpen={showHelperModal} onClose={() => setShowHelperModal(false)} title="List Your Service">
          <div className="space-y-4">
            <div className="bg-leaf-pale border border-leaf/30 rounded-lg p-3 text-sm text-stone-800">
              💼 Listing fee: <strong>$5/month</strong> — helps keep our community spam-free!
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Service Name</label>
              <input type="text" value={newHelper.title} onChange={(e) => setNewHelper({...newHelper, title: e.target.value})}
                placeholder="Snow Removal, Lawn Mowing, Dog Walking..." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
                <input type="text" value={newHelper.price} onChange={(e) => setNewHelper({...newHelper, price: e.target.value})}
                  placeholder="$20/driveway, $15/hour..." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Availability</label>
                <input type="text" value={newHelper.availability} onChange={(e) => setNewHelper({...newHelper, availability: e.target.value})}
                  placeholder="Weekends, Year-round..." className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={newHelper.description} onChange={(e) => setNewHelper({...newHelper, description: e.target.value})}
                rows="3" placeholder="Describe your service, what's included, your experience..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-leaf/40 focus:border-leaf" />
            </div>
            <button onClick={handleCreateHelper} className="w-full px-4 py-3 bg-leaf text-white rounded-lg font-semibold hover:bg-leaf-dark transition-colors">
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
                <p className="text-lg text-stone-600">📅 {showDetailModal.date} at {showDetailModal.time}</p>
                <p className="text-sm text-leaf font-medium mt-1">🏠 Hosted by #{showDetailModal.houseNumber}</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-700">{showDetailModal.description}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                <span className="font-semibold text-leaf">{showDetailModal.attendees}</span> neighbors are going
              </div>

              {/* Partner Shop Items Section */}
              {showDetailModal.partnerShopItems && showDetailModal.partnerShopItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🍕</span>
                    <span className="font-semibold text-stone-900">Ordered from Partner Shops</span>
                  </div>
                  <div className="space-y-2">
                    {showDetailModal.partnerShopItems.map((item, index) => (
                      <div key={index} className="bg-white p-2 rounded border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-900">
                              {item.shopIcon} {item.itemName} × {item.quantity}
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
                    <span className="text-lg font-bold text-leaf">
                      ${showDetailModal.partnerShopItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    💳 Order will be delivered to the event location
                  </p>
                </div>
              )}

              {/* Crowdfunding Section in Detail Modal */}
              {showDetailModal.needsFunding && (
                <div className="bg-warm-100 border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💰</span>
                    <span className="font-semibold text-stone-900">Event Fundraising</span>
                    {showDetailModal.fundingRaised >= showDetailModal.fundingGoal && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ Funded!</span>
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
                      className={`h-2.5 rounded-full transition-all ${showDetailModal.fundingRaised >= showDetailModal.fundingGoal ? "bg-green-500" : "bg-leaf"}`}
                      style={{ width: `${Math.min((showDetailModal.fundingRaised / showDetailModal.fundingGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 mb-3">{showDetailModal.fundingBackers || 0} neighbors have chipped in</p>
                  
                  {showDetailModal.fundingRaised < showDetailModal.fundingGoal && (
                    <div className="flex gap-2">
                      <button onClick={() => { handleChipIn(showDetailModal.id, 5); }} className="flex-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm hover:bg-stone-200 transition-colors">$5</button>
                      <button onClick={() => { handleChipIn(showDetailModal.id, 10); }} className="flex-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm hover:bg-stone-200 transition-colors">$10</button>
                      <button onClick={() => { handleChipIn(showDetailModal.id, 25); }} className="flex-1 px-3 py-2 bg-leaf text-white rounded-lg text-sm hover:bg-leaf-dark transition-colors">$25</button>
                      <button onClick={() => { handleChipIn(showDetailModal.id, 50); }} className="flex-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm hover:bg-stone-200 transition-colors">$50</button>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => { handleGoingToggle(showDetailModal.id); setShowDetailModal(null); }}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  showDetailModal.going ? "bg-green-100 text-green-700" : "bg-leaf text-white hover:bg-leaf-dark"
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
              <h3 className="text-xl font-bold text-stone-900">{showContactModal.title}</h3>
              <p className="text-2xl font-bold text-leaf">{showContactModal.price}</p>
              <div className="bg-leaf-pale border border-leaf/30 rounded-lg p-4">
                <p className="text-stone-800 font-medium">🏠 Walk over to House #{showContactModal.houseNumber}</p>
                <p className="text-sm text-stone-700 mt-2">Ring the doorbell or leave a note to arrange the service!</p>
              </div>
              <p className="text-stone-600 text-sm">
                Happy Neighbor encourages in-person connections. Walking over is the best way to meet your neighbors and arrange services!
              </p>
              <button onClick={() => setShowContactModal(null)} className="w-full px-4 py-3 bg-leaf text-white rounded-lg font-semibold hover:bg-leaf-dark transition-colors">
                Got It!
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
