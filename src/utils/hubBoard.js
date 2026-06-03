export const BOARD_FILTERS = [
  { id: "all", label: "All" },
  { id: "ask", label: "Asks" },
  { id: "share", label: "Share" },
  { id: "recommend", label: "Tips" },
];

export const BOARD_TYPE_LABELS = {
  ask: "Ask",
  share: "Share",
  recommend: "Neighbor tip",
};

export const BOARD_TYPE_ICONS = {
  ask: "task",
  share: "listing",
  recommend: "planner",
};

export const getBoardTypeLabel = (type) => BOARD_TYPE_LABELS[type] || "Post";
export const getBoardTypeIcon = (type) => BOARD_TYPE_ICONS[type] || "listing";

export const SHARE_LISTING_LABELS = {
  sell: "For sale",
  free: "Free",
  trade: "Trade",
};

export const filterBoardPosts = (posts, filterId) => {
  if (filterId === "all") return posts;
  return posts.filter((p) => p.type === filterId);
};

export const sortBoardPosts = (posts) =>
  [...posts].sort((a, b) => {
    const order = { ask: 0, share: 1, recommend: 2 };
    return (order[a.type] ?? 9) - (order[b.type] ?? 9);
  });
