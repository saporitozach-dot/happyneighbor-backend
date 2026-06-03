import React from "react";
import BrandIcon from "../brand/BrandIcon";
import HubCategoryChip from "./HubCategoryChip";
import { formatHouse } from "../../utils/hubUi";

const HubNeighborsPanel = ({ neighbors, onOfferSkill, onContact }) => (
  <div>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Neighbors</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-lg leading-relaxed">
          Skills people on your block are happy to offer. Walk over to coordinate — no gig-app middleman.
        </p>
      </div>
      <button type="button" onClick={onOfferSkill} className="btn-party-sm rounded-xl shrink-0">
        Share a skill
      </button>
    </div>

    <div className="hub-callout mb-6 text-sm text-slate-600 leading-relaxed">
      <span className="font-medium text-slate-900">How it works:</span> neighbors opt in with what they can help
      with. Rates are friendly guidelines — most coordination happens in person on the street.
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {neighbors.map((n) => (
        <article key={n.id} className="hub-card p-5 flex flex-col">
          <HubCategoryChip
            icon={n.skillIcon || "service"}
            label={n.headline}
            className="mb-3"
          />
          <p className="text-xs text-slate-500">{formatHouse(n.houseNumber)}</p>
          <p className="text-sm text-slate-600 mt-2 flex-1 leading-relaxed">{n.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
            <span>{n.availability}</span>
            <span>{n.compensation}</span>
            <span className="inline-flex items-center gap-1">
              <BrandIcon name="users" size={12} />
              {n.endorsements} endorsements
            </span>
          </div>
          <button
            type="button"
            onClick={() => onContact(n)}
            className="mt-4 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Say hello at {formatHouse(n.houseNumber)}
          </button>
        </article>
      ))}
    </div>
  </div>
);

export default HubNeighborsPanel;
