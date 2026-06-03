import React from "react";
import BrandIcon from "../brand/BrandIcon";
import HubIconMark from "../brand/HubIconMark";
import { getBoardTypeIcon, getBoardTypeLabel } from "../../utils/hubBoard";
import { getEventTypeIcon, getEventTypeLabel, formatHouse } from "../../utils/hubUi";

const HubOverview = ({
  events,
  boardPosts,
  neighbors,
  onTabChange,
  onPlanParty,
  onPostBoard,
  onViewEvent,
  onViewPost,
}) => {
  const nextEvent = events[0];
  const recentBoard = boardPosts.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onPlanParty}
          className="hub-card p-4 text-left hover:border-indigo-200 transition-colors group"
        >
          <HubIconMark icon="planner" size="sm" className="mb-3" />
          <p className="font-display font-semibold text-slate-900 text-sm group-hover:text-indigo-700">
            Plan a block party
          </p>
          <p className="text-xs text-slate-500 mt-1">AI draft, pizza, neighbor texts</p>
        </button>
        <button
          type="button"
          onClick={onPostBoard}
          className="hub-card p-4 text-left hover:border-indigo-200 transition-colors group"
        >
          <HubIconMark icon="listing" size="sm" className="mb-3" />
          <p className="font-display font-semibold text-slate-900 text-sm group-hover:text-indigo-700">
            Post on the board
          </p>
          <p className="text-xs text-slate-500 mt-1">Ask, share, or recommend</p>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("neighbors")}
          className="hub-card p-4 text-left hover:border-indigo-200 transition-colors group"
        >
          <HubIconMark icon="tab-neighbors" size="sm" className="mb-3" />
          <p className="font-display font-semibold text-slate-900 text-sm group-hover:text-indigo-700">
            Browse neighbors
          </p>
          <p className="text-xs text-slate-500 mt-1">{neighbors.length} skills on the block</p>
        </button>
      </div>

      {nextEvent && (
        <section className="hub-card overflow-hidden">
          <div className="px-5 py-3 bg-indigo-600 text-white flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Up next on your block</p>
            <button
              type="button"
              onClick={() => onTabChange("events")}
              className="text-xs text-white/90 hover:text-white underline underline-offset-2"
            >
              All events
            </button>
          </div>
          <button
            type="button"
            onClick={() => onViewEvent(nextEvent)}
            className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 w-full text-left hover:bg-slate-50/80 transition-colors"
          >
            <HubIconMark icon={getEventTypeIcon(nextEvent.type)} />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-lg text-slate-900">{nextEvent.title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                {nextEvent.date} · {nextEvent.time} · {formatHouse(nextEvent.houseNumber)}
              </p>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{nextEvent.description}</p>
            </div>
            <div className="shrink-0 text-center sm:text-right">
              <p className="text-2xl font-display font-bold text-indigo-600">{nextEvent.attendees}</p>
              <p className="text-xs text-slate-500">neighbors going</p>
            </div>
          </button>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">Block board</h2>
          <button
            type="button"
            onClick={() => onTabChange("board")}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            View all
          </button>
        </div>
        <div className="space-y-2">
          {recentBoard.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onViewPost(post)}
              className="hub-card w-full p-4 text-left flex items-start gap-3 hover:border-indigo-200 transition-colors"
            >
              <HubIconMark icon={getBoardTypeIcon(post.type)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {getBoardTypeLabel(post.type)}
                </p>
                <p className="font-medium text-slate-900 truncate">{post.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatHouse(post.houseNumber)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <p className="text-xs text-slate-500 text-center max-w-md mx-auto leading-relaxed">
        BlockParty is built for real streets: plan together, chip in for parties, and coordinate face to face — not another anonymous marketplace.
      </p>
    </div>
  );
};

export default HubOverview;
