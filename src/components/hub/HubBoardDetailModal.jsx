import React from "react";
import HubModal from "./HubModal";
import HubCategoryChip from "./HubCategoryChip";
import { getBoardTypeIcon, getBoardTypeLabel, SHARE_LISTING_LABELS } from "../../utils/hubBoard";
import { getTaskCategoryIcon, getTaskCategoryLabel, formatHouse } from "../../utils/hubUi";

const HubBoardDetailModal = ({ post, isOpen, onClose, onRespond, onEndorse }) => {
  if (!post) return null;

  const chipIcon =
    post.type === "ask"
      ? getTaskCategoryIcon(post.category)
      : getBoardTypeIcon(post.type);
  const chipLabel =
    post.type === "ask"
      ? getTaskCategoryLabel(post.category)
      : post.type === "share"
        ? SHARE_LISTING_LABELS[post.listingType] || "Share"
        : getBoardTypeLabel(post.type);

  return (
    <HubModal isOpen={isOpen} onClose={onClose} title={post.title}>
      <div className="space-y-4">
        <HubCategoryChip icon={chipIcon} label={chipLabel} />
        <p className="text-sm text-slate-600 leading-relaxed">{post.description}</p>
        <p className="text-xs text-slate-500">{formatHouse(post.houseNumber)}</p>

        {post.type === "ask" && (
          <p className="text-sm text-indigo-600 font-medium">
            {post.responses || 0} neighbor{(post.responses || 0) !== 1 ? "s" : ""} offered to help
          </p>
        )}
        {post.type === "share" && (
          <div className="flex items-center justify-between">
            {post.listingType === "sell" && (
              <span className="text-xl font-bold text-indigo-600">${post.price}</span>
            )}
            {post.listingType === "free" && (
              <span className="text-sm font-bold uppercase text-emerald-700">Free</span>
            )}
            <span className="text-xs text-slate-500">{post.interested || 0} interested</span>
          </div>
        )}
        {post.type === "recommend" && (
          <p className="text-sm text-slate-600">
            {post.endorsedBy || 0} neighbors agree with this tip
          </p>
        )}

        <div className="hub-callout text-sm text-slate-700">
          BlockParty is built for walk-over coordination. Use this hub to express interest, then
          meet in person on the street.
        </div>

        <div className="flex flex-col gap-2">
          {post.type === "recommend" && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEndorse(post);
              }}
              className="btn-party w-full"
            >
              Me too — good tip
            </button>
          )}
          {post.type === "ask" && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRespond(post, "ask");
              }}
              className="btn-party w-full"
            >
              I can help
            </button>
          )}
          {post.type === "share" && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRespond(post, "share");
              }}
              className="btn-party w-full"
            >
              I'm interested
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-party-outline w-full">
            Close
          </button>
        </div>
      </div>
    </HubModal>
  );
};

export default HubBoardDetailModal;
