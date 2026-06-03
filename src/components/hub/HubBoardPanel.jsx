import React, { useState } from "react";
import BrandIcon from "../brand/BrandIcon";
import HubCategoryChip from "./HubCategoryChip";
import {
  BOARD_FILTERS,
  filterBoardPosts,
  getBoardTypeIcon,
  getBoardTypeLabel,
  SHARE_LISTING_LABELS,
} from "../../utils/hubBoard";
import { getTaskCategoryIcon, getTaskCategoryLabel, formatHouse } from "../../utils/hubUi";

const HubBoardPanel = ({ posts, onPost, onViewPost, onRespond, onEndorse }) => {
  const [filter, setFilter] = useState("all");
  const visible = filterBoardPosts(posts, filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900">Block board</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-lg leading-relaxed">
            One place for favors, free stuff, trades, and neighbor recommendations — not a city-wide marketplace.
          </p>
        </div>
        <button type="button" onClick={onPost} className="btn-party-sm rounded-xl shrink-0">
          New post
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {BOARD_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="hub-card p-8 text-center text-slate-500 text-sm">
            Nothing here yet. Be the first to post on your block.
          </div>
        )}
        {visible.map((post) => (
          <BoardPostCard
            key={post.id}
            post={post}
            onViewPost={onViewPost}
            onRespond={onRespond}
            onEndorse={onEndorse}
          />
        ))}
      </div>
    </div>
  );
};

const BoardPostCard = ({ post, onViewPost, onRespond, onEndorse }) => {
  if (post.type === "recommend") {
    return (
      <article className="hub-card p-5 border-l-4 border-l-violet-400">
        <div className="flex items-start gap-3">
          <HubCategoryChip icon={getBoardTypeIcon(post.type)} label={getBoardTypeLabel(post.type)} />
          <div className="flex-1 min-w-0">
            <button type="button" onClick={() => onViewPost(post)} className="text-left w-full">
              <h3 className="font-display font-semibold text-slate-900 hover:text-indigo-700">{post.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{post.description}</p>
            </button>
            <p className="text-xs text-slate-500 mt-3">
              Suggested by {formatHouse(post.houseNumber)} · {post.endorsedBy} neighbors agree
            </p>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => onEndorse(post)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Me too
              </button>
              <button type="button" onClick={() => onViewPost(post)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                Details
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (post.type === "ask") {
    return (
      <article className="hub-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <HubCategoryChip
            icon={getTaskCategoryIcon(post.category)}
            label={getTaskCategoryLabel(post.category)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <button type="button" onClick={() => onViewPost(post)} className="text-left">
                <h3 className="font-display font-semibold text-slate-900 text-lg hover:text-indigo-700">{post.title}</h3>
              </button>
              <UrgencyBadge urgency={post.urgency} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{formatHouse(post.houseNumber)}</p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{post.description}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <span className="text-sm text-indigo-600 font-medium">
                {post.responses} neighbor{post.responses !== 1 ? "s" : ""} offered
              </span>
              <button
                type="button"
                onClick={() => onRespond(post, "ask")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                I can help
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const shareLabel = SHARE_LISTING_LABELS[post.listingType] || "Share";
  return (
    <article className="hub-card p-5">
      <div className="flex items-start gap-3">
        <HubCategoryChip icon={getBoardTypeIcon("share")} label={shareLabel} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <button type="button" onClick={() => onViewPost(post)} className="text-left min-w-0">
              <h3 className="font-display font-semibold text-slate-900 hover:text-indigo-700">{post.title}</h3>
            </button>
            {post.listingType === "sell" && (
              <span className="text-lg font-bold text-indigo-600 shrink-0">${post.price}</span>
            )}
            {post.listingType === "free" && (
              <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                Free
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{formatHouse(post.houseNumber)}</p>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{post.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <span className="text-xs text-slate-500">{post.interested} interested</span>
            <button
              type="button"
              onClick={() => onRespond(post, "share")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              I'm interested
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const UrgencyBadge = ({ urgency }) => {
  const styles = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[urgency] || styles.low}`}>
      {urgency} priority
    </span>
  );
};

export default HubBoardPanel;
