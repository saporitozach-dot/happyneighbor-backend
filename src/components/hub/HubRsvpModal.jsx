import React, { useState, useEffect } from "react";
import HubModal from "./HubModal";
import { formatHouse } from "../../utils/hubUi";

const BRING_OPTIONS = [
  "Just me",
  "Side dish",
  "Drinks",
  "Dessert",
  "Chairs or tables",
  "Nothing — just excited to come",
];

const HubRsvpModal = ({ event, isOpen, onClose, onSubmit, submitting }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [bringing, setBringing] = useState(BRING_OPTIONS[0]);
  const [note, setNote] = useState("");
  const isCancel = event?.going;

  useEffect(() => {
    if (isOpen) {
      setGuestCount(1);
      setBringing(BRING_OPTIONS[0]);
      setNote("");
    }
  }, [isOpen, event?.id]);

  if (!event) return null;

  return (
    <HubModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCancel ? "Update your RSVP" : "RSVP to this event"}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="font-display font-semibold text-slate-900">{event.title}</p>
          <p className="text-sm text-slate-600 mt-1">
            {event.date} · {event.time}
          </p>
          <p className="text-xs text-slate-500 mt-1">{formatHouse(event.houseNumber)}</p>
        </div>

        {isCancel ? (
          <>
            <p className="text-sm text-slate-600">
              You're marked as going. Remove yourself from the headcount?
            </p>
            <button
              type="button"
              onClick={() => onSubmit({ going: false })}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl border border-red-200 text-red-700 font-medium hover:bg-red-50"
            >
              {submitting ? "Updating…" : "Can't make it anymore"}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                People in your household attending
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="input-party"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What you're bringing</label>
              <select value={bringing} onChange={(e) => setBringing(e.target.value)} className="input-party">
                {BRING_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note for neighbors (optional)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-party"
                placeholder="Kids will join for the bike parade"
              />
            </div>
            <button
              type="button"
              onClick={() => onSubmit({ going: true, guestCount, bringing, note: note.trim() })}
              disabled={submitting}
              className="w-full btn-party disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Confirm I'm going"}
            </button>
          </>
        )}
      </div>
    </HubModal>
  );
};

export default HubRsvpModal;
