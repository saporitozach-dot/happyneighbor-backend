import React, { useState, useEffect } from "react";
import HubModal from "./HubModal";
import { formatHouse } from "../../utils/hubUi";

const PRESETS = [5, 10, 25, 50];

const HubChipInModal = ({ event, isOpen, onClose, onSubmit, submitting }) => {
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(25);
      setCustom("");
      setNote("");
      setHouseNumber("");
    }
  }, [isOpen, event?.id]);

  if (!event) return null;

  const finalAmount = custom ? parseInt(custom, 10) : amount;
  const remaining = Math.max(0, (event.fundingGoal || 0) - (event.fundingRaised || 0));

  const handleSubmit = () => {
    if (!finalAmount || finalAmount < 1) return;
    onSubmit({
      amount: finalAmount,
      note: note.trim(),
      houseNumber: houseNumber.trim() || "Your House",
    });
  };

  return (
    <HubModal isOpen={isOpen} onClose={onClose} title="Chip in for this event">
      <div className="space-y-4">
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
          <p className="font-display font-semibold text-slate-900">{event.title}</p>
          {event.fundingDescription && (
            <p className="text-sm text-slate-600 mt-1">{event.fundingDescription}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            ${event.fundingRaised || 0} raised · ${remaining} to go
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Amount</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setAmount(n);
                  setCustom("");
                }}
                className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                  !custom && amount === n
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ${n}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="input-party mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your house # (optional)</label>
          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="e.g. 247"
            className="input-party"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Note for the host (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Happy to help with setup too!"
            className="input-party"
          />
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Demo mode records your chip-in locally and on the block hub API when the server is running.
          Stripe checkout will connect here for real payments.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !finalAmount || finalAmount < 1}
          className="w-full btn-party disabled:opacity-50"
        >
          {submitting ? "Processing…" : `Chip in $${finalAmount || 0}`}
        </button>
      </div>
    </HubModal>
  );
};

export default HubChipInModal;
