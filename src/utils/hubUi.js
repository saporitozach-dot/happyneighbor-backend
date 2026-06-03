export const EVENT_TYPE_LABELS = {
  party: "Party",
  sale: "Sale",
  activity: "Activity",
  meeting: "Meeting",
  other: "Event",
};

export const EVENT_TYPE_ICONS = {
  party: "party",
  sale: "sale",
  activity: "activity",
  meeting: "meeting",
  other: "event",
};

export const TASK_CATEGORY_LABELS = {
  tech: "Tech",
  yard: "Yard",
  pets: "Pets",
  moving: "Moving",
  errands: "Errands",
  other: "Other",
};

export const TASK_CATEGORY_ICONS = {
  tech: "tech",
  yard: "yard",
  pets: "pets",
  moving: "moving",
  errands: "errands",
  other: "task",
};

export const MARKETPLACE_CATEGORY_LABELS = {
  furniture: "Furniture",
  electronics: "Electronics",
  sports: "Sports",
  outdoor: "Outdoor",
  baby: "Baby & kids",
  clothing: "Clothing",
  books: "Books",
  free: "Free",
  other: "Other",
};

export const MARKETPLACE_CATEGORY_ICONS = {
  furniture: "furniture",
  electronics: "electronics",
  sports: "sports",
  outdoor: "outdoor",
  baby: "baby",
  clothing: "clothing",
  books: "books",
  free: "free",
  other: "listing",
};

export const getEventTypeLabel = (type) => EVENT_TYPE_LABELS[type] || "Event";
export const getEventTypeIcon = (type) => EVENT_TYPE_ICONS[type] || "event";
export const getTaskCategoryLabel = (category) => TASK_CATEGORY_LABELS[category] || "Ask";
export const getTaskCategoryIcon = (category) => TASK_CATEGORY_ICONS[category] || "task";
export const getMarketplaceCategoryLabel = (category) =>
  MARKETPLACE_CATEGORY_LABELS[category] || "Item";
export const getMarketplaceCategoryIcon = (category) =>
  MARKETPLACE_CATEGORY_ICONS[category] || "listing";

export const getServiceCategoryLabel = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("snow")) return "Seasonal";
  if (lower.includes("lawn") || lower.includes("yard")) return "Yard care";
  if (lower.includes("dog") || lower.includes("pet") || lower.includes("walk")) return "Pets";
  if (lower.includes("tech") || lower.includes("computer")) return "Tech";
  return "Neighbor";
};

export const getServiceCategoryIcon = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes("snow")) return "seasonal";
  if (lower.includes("lawn") || lower.includes("yard")) return "yard-care";
  if (lower.includes("dog") || lower.includes("pet") || lower.includes("walk")) return "pets";
  if (lower.includes("tech") || lower.includes("computer")) return "tech";
  return "service";
};

export const formatHouse = (houseNumber) => `House #${houseNumber}`;

/** Hub navigation — events-first, then community utilities */
export const HUB_TABS = [
  { id: "home", label: "Overview", icon: "tab-home" },
  { id: "events", label: "Events", icon: "tab-events" },
  { id: "board", label: "Block board", icon: "tab-board" },
  { id: "neighbors", label: "Neighbors", icon: "tab-neighbors" },
];
