import React from "react";
import BrandIcon from "../brand/BrandIcon";

const HubTabBar = ({ tabs, activeId, onChange }) => (
  <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-[4.25rem] z-40 shadow-sm shadow-slate-900/5">
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8">
      <div className="flex gap-0.5 overflow-x-auto py-1" role="tablist">
        {tabs.map((tab) => {
          const active = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap rounded-t-xl transition-colors border-b-2 -mb-px ${
                active
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/80"
                  : "border-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <BrandIcon
                name={tab.icon}
                size={18}
                className={active ? "text-indigo-600" : "text-slate-400"}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export default HubTabBar;
