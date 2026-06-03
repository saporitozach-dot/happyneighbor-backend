import React from "react";
import HubModal from "./HubModal";
import HubCategoryChip from "./HubCategoryChip";
import { formatHouse } from "../../utils/hubUi";

const HubNeighborModal = ({ isOpen, onClose, draft, onChange, onSubmit, submitting, error }) => (
  <HubModal isOpen={isOpen} onClose={onClose} title="Share a skill on your block">
    <div className="space-y-4">
      <p className="text-sm text-slate-600 leading-relaxed">
        Tell neighbors what you're comfortable helping with. They'll walk over to coordinate — keep it friendly and local.
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">What you offer</label>
        <input
          type="text"
          value={draft.headline}
          onChange={(e) => onChange({ ...draft, headline: e.target.value })}
          placeholder="Snow removal, dog walking, tech help..."
          className="input-party"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          className="input-party"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Typical compensation</label>
          <input
            type="text"
            value={draft.compensation}
            onChange={(e) => onChange({ ...draft, compensation: e.target.value })}
            placeholder="Coffee, $20, trade..."
            className="input-party"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">When available</label>
          <input
            type="text"
            value={draft.availability}
            onChange={(e) => onChange({ ...draft, availability: e.target.value })}
            placeholder="Weekends, winter..."
            className="input-party"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={onSubmit} disabled={submitting} className="w-full btn-party disabled:opacity-50">
        {submitting ? "Saving…" : "Add to neighbor list"}
      </button>
    </div>
  </HubModal>
);

export const HubNeighborContactModal = ({ neighbor, onClose }) => {
  if (!neighbor) return null;
  return (
    <HubModal isOpen={!!neighbor} onClose={onClose} title={`House #${neighbor.houseNumber}`}>
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <HubCategoryChip icon={neighbor.skillIcon || "service"} label={neighbor.headline} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{neighbor.description}</p>
        <p className="text-sm font-medium text-indigo-600">{neighbor.compensation}</p>
        <div className="hub-callout text-left text-sm text-slate-700">
          <p className="font-medium text-slate-900">Walk over to {formatHouse(neighbor.houseNumber)}</p>
          <p className="mt-2">Ring the bell or leave a note — BlockParty is built for in-person neighbor connections.</p>
        </div>
        <button type="button" onClick={onClose} className="w-full btn-party">
          Got it
        </button>
      </div>
    </HubModal>
  );
};

export default HubNeighborModal;
