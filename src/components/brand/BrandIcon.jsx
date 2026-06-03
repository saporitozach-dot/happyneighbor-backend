import React from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/** BlockParty mark — three stacked blocks */
const BlockMark = () => (
  <>
    <rect x="4" y="13" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.35" stroke="none" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="8.5" y="4" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
  </>
);

const paths = {
  "tab-home": (
    <>
      <path {...stroke} d="M4 11l8-6 8 6v9H4v-9z" />
      <path {...stroke} d="M10 20v-5h4v5" />
    </>
  ),
  "tab-events": (
    <>
      <path {...stroke} d="M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path {...stroke} d="M8 10h8M8 14h5" />
    </>
  ),
  "tab-board": (
    <>
      <path {...stroke} d="M6 5h12a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1z" />
      <path {...stroke} d="M9 9h6M9 13h4" />
    </>
  ),
  "tab-neighbors": (
    <>
      <circle {...stroke} cx="9" cy="9" r="2.5" />
      <circle {...stroke} cx="15" cy="9" r="2.5" />
      <path {...stroke} d="M5 19c0-2.2 1.8-4 4-4s4 1.8 4 4M11 19c0-2.2 1.8-4 4-4" />
    </>
  ),
  "tab-marketplace": (
    <>
      <path {...stroke} d="M5 9h14l-1.2 9H6.2L5 9z" />
      <path {...stroke} d="M9 9V7a3 3 0 016 0v2" />
    </>
  ),
  "tab-tasks": (
    <>
      <path {...stroke} d="M9 6h10M9 12h10M9 18h6" />
      <path {...stroke} d="M5 6l1.5 1.5L5 9M5 12l1.5 1.5L5 15M5 18l1.5 1.5L5 21" />
    </>
  ),
  "tab-helpers": (
    <>
      <path {...stroke} d="M14.5 10.5a3.5 3.5 0 11-5 0" />
      <path {...stroke} d="M12 14v3M9.5 20h5" />
      <path {...stroke} d="M7 8l-2-2M17 8l2-2" />
    </>
  ),
  party: (
    <>
      <path {...stroke} d="M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1" />
      <circle {...stroke} cx="12" cy="14" r="5" />
      <path {...stroke} d="M10 13h4M11 15h2" />
    </>
  ),
  sale: (
    <>
      <path {...stroke} d="M7 7l4-4 6 6-4 4-6-6z" />
      <circle {...stroke} cx="15" cy="9" r="1.25" fill="currentColor" />
      <path {...stroke} d="M5 19l3-3" />
    </>
  ),
  activity: (
    <>
      <path {...stroke} d="M12 4l2 6h5l-4 3 1.5 7L12 16l-4.5 4 1.5-7-4-3h5z" />
    </>
  ),
  meeting: (
    <>
      <circle {...stroke} cx="9" cy="9" r="2.5" />
      <circle {...stroke} cx="15" cy="9" r="2.5" />
      <path {...stroke} d="M5 19c0-2.2 1.8-4 4-4s4 1.8 4 4M11 19c0-2.2 1.8-4 4-4" />
    </>
  ),
  event: (
    <>
      <rect {...stroke} x="5" y="6" width="14" height="14" rx="2" />
      <path {...stroke} d="M9 10h6M9 14h4" />
    </>
  ),
  tech: (
    <>
      <rect {...stroke} x="4" y="6" width="16" height="11" rx="1.5" />
      <path {...stroke} d="M9 20h6" />
    </>
  ),
  yard: (
    <>
      <path {...stroke} d="M12 20V10M8 14c2-4 8-4 8 0" />
      <path {...stroke} d="M6 20h12" />
    </>
  ),
  pets: (
    <>
      <circle {...stroke} cx="8" cy="9" r="1.5" />
      <circle {...stroke} cx="12" cy="7" r="1.5" />
      <circle {...stroke} cx="16" cy="9" r="1.5" />
      <path {...stroke} d="M7 12c1 3 3 5 5 5s4-2 5-5" />
    </>
  ),
  moving: (
    <>
      <path {...stroke} d="M5 9h14v10H5z" />
      <path {...stroke} d="M9 9V6h6v3M12 13v3" />
    </>
  ),
  errands: (
    <>
      <path {...stroke} d="M5 12h11M14 9l3 3-3 3" />
      <circle {...stroke} cx="7" cy="12" r="2" />
    </>
  ),
  task: (
    <>
      <path {...stroke} d="M7 7h10v10H7z" />
      <path {...stroke} d="M10 12l2 2 4-4" />
    </>
  ),
  furniture: (
    <>
      <path {...stroke} d="M5 14h14v4H5zM7 14V9h10v5" />
      <path {...stroke} d="M9 9V7h6v2" />
    </>
  ),
  electronics: (
    <>
      <rect {...stroke} x="7" y="7" width="10" height="10" rx="1" />
      <path {...stroke} d="M10 11h4M10 14h2" />
    </>
  ),
  sports: (
    <>
      <circle {...stroke} cx="12" cy="12" r="7" />
      <path {...stroke} d="M5 12h14M12 5c2 2.5 2 11.5 0 14M12 5c-2 2.5-2 11.5 0 14" />
    </>
  ),
  outdoor: (
    <>
      <path {...stroke} d="M12 4L6 18h12L12 4z" />
      <path {...stroke} d="M8 14h8" />
    </>
  ),
  baby: (
    <>
      <circle {...stroke} cx="12" cy="10" r="3" />
      <path {...stroke} d="M8 18c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" />
    </>
  ),
  clothing: (
    <>
      <path {...stroke} d="M12 5l-3 3h6l-3-3zM7 8h10l-1 11H8L7 8z" />
    </>
  ),
  books: (
    <>
      <path {...stroke} d="M6 6h5v12H6a1 1 0 01-1-1V7a1 1 0 011-1zM13 6h5a1 1 0 011 1v10a1 1 0 01-1 1h-5V6z" />
    </>
  ),
  free: (
    <>
      <path {...stroke} d="M12 5v14M5 12h14" />
      <circle {...stroke} cx="12" cy="12" r="7" />
    </>
  ),
  listing: (
    <>
      <path {...stroke} d="M5 7h14M5 12h14M5 17h9" />
    </>
  ),
  seasonal: (
    <>
      <path {...stroke} d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 14l-4 4.5 1.5-4.5L6 7.5h4.5L12 3z" />
    </>
  ),
  "yard-care": (
    <>
      <path {...stroke} d="M4 18h16M8 18c0-4 2-8 4-10s4 6 4 10" />
    </>
  ),
  service: (
    <>
      <path {...stroke} d="M14.5 6.5l2 2-8 8H6v-2.5l8-8z" />
      <path {...stroke} d="M12 8l2 2" />
    </>
  ),
  pizza: (
    <>
      <path {...stroke} d="M5 18c4-8 10-12 14-14-2 6-2 12 0 14-4-2-10 0-14z" />
      <circle {...stroke} cx="14" cy="9" r="1" fill="currentColor" />
      <circle {...stroke} cx="11" cy="12" r="1" fill="currentColor" />
    </>
  ),
  house: (
    <>
      <path {...stroke} d="M4 11l8-6 8 6v9H4v-9z" />
      <path {...stroke} d="M10 20v-5h4v5" />
    </>
  ),
  funding: (
    <>
      <circle {...stroke} cx="12" cy="12" r="7" />
      <path {...stroke} d="M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5" />
    </>
  ),
  users: (
    <>
      <circle {...stroke} cx="9" cy="10" r="2" />
      <circle {...stroke} cx="15" cy="10" r="2" />
      <path {...stroke} d="M5 18c0-2.5 1.8-4 4-4M15 18c0-2.5 1.8-4 4-4" />
    </>
  ),
  planner: (
    <>
      <path {...stroke} d="M12 3l1.2 4h4.3l-3.5 2.5 1.3 4.5L12 11.5 8.7 14l1.3-4.5L6.5 7h4.3L12 3z" />
      <path {...stroke} d="M5 19h14" opacity="0.6" />
    </>
  ),
  lock: (
    <>
      <rect {...stroke} x="6" y="11" width="12" height="9" rx="2" />
      <path {...stroke} d="M9 11V8a3 3 0 016 0v3" />
    </>
  ),
  "block-mark": <BlockMark />,
};

const BrandIcon = ({ name = "event", size = 24, className = "" }) => {
  const content = paths[name] || paths.event;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      {content}
    </svg>
  );
};

export default BrandIcon;
