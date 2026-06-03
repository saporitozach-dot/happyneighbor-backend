import React from "react";
import HubIconMark from "../brand/HubIconMark";

const HubCategoryChip = ({ icon, label, className = "" }) => (
  <div className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
    <HubIconMark icon={icon} size="sm" />
    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
      {label}
    </span>
  </div>
);

export default HubCategoryChip;
