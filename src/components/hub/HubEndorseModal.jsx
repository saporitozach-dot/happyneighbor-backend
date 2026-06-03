import React from "react";
import HubModal from "./HubModal";
import { formatHouse } from "../../utils/hubUi";

const HubEndorseModal = ({ post, isOpen, onClose, onSubmit, submitting }) => {
  if (!post) return null;

  return (
    <HubModal isOpen={isOpen} onClose={onClose} title="Endorse this tip">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{post.description}</p>
        <p className="text-xs text-slate-500">
          Suggested by {formatHouse(post.houseNumber)} · currently {post.endorsedBy || 0} endorsements
        </p>
        <div className="hub-callout text-sm text-slate-700">
          Endorsing helps neighbors spot trusted local picks for parties, services, and block
          traditions. Your name stays tied to your house number on the block only.
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full btn-party disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Yes — me too"}
        </button>
      </div>
    </HubModal>
  );
};

export default HubEndorseModal;
