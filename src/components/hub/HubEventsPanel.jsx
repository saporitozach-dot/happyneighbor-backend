import React from "react";
import BrandIcon from "../brand/BrandIcon";
import HubCategoryChip from "./HubCategoryChip";
import { getEventTypeIcon, getEventTypeLabel, formatHouse } from "../../utils/hubUi";

const HubEventsPanel = ({
  events,
  onPlanParty,
  onManualEvent,
  onViewDetail,
  onOpenRsvp,
  onOpenChipIn,
}) => (
  <div>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Events</h2>
        <p className="text-slate-500 text-sm mt-1">
          Block parties, chip-ins, and local food — the heart of your hub.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onPlanParty} className="btn-party-sm rounded-xl flex items-center gap-2">
          <BrandIcon name="planner" size={18} className="text-white" />
          Plan block party
        </button>
        <button
          type="button"
          onClick={onManualEvent}
          className="px-4 py-2 border border-slate-300 text-slate-800 rounded-xl font-medium hover:bg-slate-50 transition-all"
        >
          Add event
        </button>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {events.map((event) => {
        const isFunded = event.needsFunding && event.fundingRaised >= event.fundingGoal;
        const fundingPercent = event.needsFunding
          ? Math.min((event.fundingRaised / event.fundingGoal) * 100, 100)
          : 0;

        return (
          <div key={event.id} className="hub-card overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between gap-3 mb-3">
                <HubCategoryChip icon={getEventTypeIcon(event.type)} label={getEventTypeLabel(event.type)} />
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {event.needsFunding && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        isFunded ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <BrandIcon name="funding" size={14} className="opacity-70" />
                      {isFunded ? "Funded" : "Chip-in open"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                    <BrandIcon name="users" size={14} />
                    {event.attendees} going
                  </span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">{event.title}</h3>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
              <p className="text-sm text-slate-500">
                {event.date} · {event.time}
              </p>
              {event.partnerShopItems?.length > 0 && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                  <BrandIcon name="pizza" size={14} />
                  Local food attached
                </p>
              )}
              <p className="inline-flex items-center gap-1 text-xs text-slate-500 mt-3">
                <BrandIcon name="house" size={14} className="text-slate-400" />
                {formatHouse(event.houseNumber)}
              </p>

              {event.needsFunding && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">${event.fundingRaised || 0} raised</span>
                    <span className="text-slate-500">of ${event.fundingGoal}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isFunded ? "bg-emerald-500" : "bg-indigo-500"}`}
                      style={{ width: `${fundingPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{event.fundingBackers || 0} neighbors chipped in</p>
                  {!isFunded && (
                    <div className="flex gap-2 mt-3">
                      {[5, 10, 25].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => onOpenChipIn(event)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                            amt === 25
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-slate-50/80 px-5 py-3 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => onViewDetail(event)}
                className="text-indigo-600 font-medium text-sm hover:underline"
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => onOpenRsvp(event)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  event.going ? "bg-emerald-100 text-emerald-800" : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {event.going ? "Going" : "I'm going"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default HubEventsPanel;
