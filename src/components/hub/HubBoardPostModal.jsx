import React from "react";
import HubModal from "./HubModal";

const BOARD_TYPES = [
  { id: "ask", label: "Ask", hint: "Need a favor or help" },
  { id: "share", label: "Share", hint: "Sell, free, or trade" },
  { id: "recommend", label: "Tip", hint: "Recommend a neighbor or local spot" },
];

const HubBoardPostModal = ({ isOpen, onClose, draft, onChange, onSubmit, submitting, error }) => (
  <HubModal isOpen={isOpen} onClose={onClose} title="Post on the block board">
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Post type</p>
        <div className="grid grid-cols-3 gap-2">
          {BOARD_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...draft, type: t.id })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                draft.type === t.id
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">{t.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder={
            draft.type === "ask"
              ? "What do you need?"
              : draft.type === "share"
                ? "What are you offering?"
                : "Who or what do you recommend?"
          }
          className="input-party"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
        <textarea
          rows={3}
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          className="input-party"
          placeholder="Enough detail for neighbors to respond in person."
        />
      </div>

      {draft.type === "ask" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={draft.category}
              onChange={(e) => onChange({ ...draft, category: e.target.value })}
              className="input-party"
            >
              <option value="yard">Yard</option>
              <option value="pets">Pets</option>
              <option value="tech">Tech</option>
              <option value="moving">Moving</option>
              <option value="errands">Errands</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              value={draft.urgency}
              onChange={(e) => onChange({ ...draft, urgency: e.target.value })}
              className="input-party"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      )}

      {draft.type === "share" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Listing type</label>
            <select
              value={draft.listingType}
              onChange={(e) => onChange({ ...draft, listingType: e.target.value })}
              className="input-party"
            >
              <option value="sell">For sale</option>
              <option value="free">Free</option>
              <option value="trade">Trade / borrow</option>
            </select>
          </div>
          {draft.listingType === "sell" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => onChange({ ...draft, price: e.target.value })}
                className="input-party"
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={onSubmit} disabled={submitting} className="w-full btn-party disabled:opacity-50">
        {submitting ? "Posting…" : "Post to board"}
      </button>
    </div>
  </HubModal>
);

export default HubBoardPostModal;
