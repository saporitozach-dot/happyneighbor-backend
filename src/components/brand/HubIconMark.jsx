import React from "react";
import BrandIcon from "./BrandIcon";

const sizeMap = {
  sm: { box: "w-9 h-9", icon: 18 },
  md: { box: "w-11 h-11", icon: 22 },
  lg: { box: "w-14 h-14", icon: 28 },
};

const HubIconMark = ({ icon, size = "md", className = "" }) => {
  const s = sizeMap[size] || sizeMap.md;
  return (
    <span
      className={`hub-icon-mark shrink-0 ${s.box} ${className}`}
      aria-hidden
    >
      <BrandIcon name={icon} size={s.icon} className="text-indigo-600" />
    </span>
  );
};

export default HubIconMark;
