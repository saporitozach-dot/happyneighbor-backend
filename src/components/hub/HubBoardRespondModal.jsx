import React, { useState, useEffect } from "react";
import HubModal from "./HubModal";
import { formatHouse } from "../../utils/hubUi";

const HubBoardRespondModal = ({ post, respondType, isOpen, onClose, onSubmit, submitting }) => {
  const [message, setMessage] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setHouseNumber("");
    }
  }, [isOpen, post?.id]);

  if (!post) return null;

  const isAsk = respondType === "ask";
  const title = isAsk ? "Offer to help" : "Express interest";

  return (
    <HubModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="font-medium text-slate-900">{post.title}</p>
          <p className="text-xs text-slate-500 mt-1">Posted from {formatHouse(post.houseNumber)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your house #</label>
          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="So they know who to expect"
            className="input-party"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isAsk ? "Quick message" : "What you'd like to know"}
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-party"
            placeholder={
              isAsk
                ? "I can stop by Saturday morning with my mower."
                : "Is this still available? I can pick up today."
            }
          />
        </div>

        <div className="hub-callout text-sm text-slate-700">
          <p className="font-medium text-slate-900">Next step: walk over</p>
          <p className="mt-1">
            Your response is logged on the block hub. Follow up in person at{" "}
            {formatHouse(post.houseNumber)} — that's how BlockParty blocks work.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onSubmit({
              message: message.trim(),
              houseNumber: houseNumber.trim() || "Your House",
              type: respondType,
            })
          }
          disabled={submitting}
          className="w-full btn-party disabled:opacity-50"
        >
          {submitting ? "Sending…" : isAsk ? "Send offer to help" : "Send interest"}
        </button>
      </div>
    </HubModal>
  );
};

export default HubBoardRespondModal;
