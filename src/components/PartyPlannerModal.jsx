import React, { useState } from "react";
import { generatePartyPlan, PARTY_TEMPLATES } from "../utils/partyPlanner";
import { API_URL } from "../utils/apiConfig";

const PIZZA_SHOP = {
  id: 1,
  name: "Tony's Pizza",
  icon: "🍕",
  items: [
    { id: 1, name: "Large Cheese Pizza", price: 18.99, serves: "8-10 people" },
    { id: 2, name: "Large Pepperoni Pizza", price: 21.99, serves: "8-10 people" },
    { id: 3, name: "Party Pack (3 Large Pizzas)", price: 52.99, serves: "24-30 people" },
    { id: 4, name: "Breadsticks (12 pieces)", price: 6.99, serves: "6-8 people" },
    { id: 5, name: "Wings (20 pieces)", price: 24.99, serves: "8-10 people" },
  ],
};

const PartyPlannerModal = ({ isOpen, onClose, onPublish, streetName, streetId }) => {
  const [step, setStep] = useState(1);
  const [templateKey, setTemplateKey] = useState("summer");
  const [guests, setGuests] = useState("24");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [plan, setPlan] = useState(null);
  const [pizzaItem, setPizzaItem] = useState(null);
  const [notifyPhones, setNotifyPhones] = useState("");
  const [notifyStatus, setNotifyStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setTemplateKey("summer");
    setGuests("24");
    setDate("");
    setTime("16:00");
    setPlan(null);
    setPizzaItem(null);
    setNotifyPhones("");
    setNotifyStatus(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const buildPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/party-planner/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey, guests, date, time, streetName }),
      });
      const data = await res.json();
      const nextPlan = data.plan || generatePartyPlan({ templateKey, guests, date, time, streetName });
      setPlan(nextPlan);
      const match = PIZZA_SHOP.items.find((i) => i.name === nextPlan.recommendedPizza) || PIZZA_SHOP.items[2];
      setPizzaItem({ ...match, shopName: PIZZA_SHOP.name, shopIcon: PIZZA_SHOP.icon, quantity: 1 });
      setStep(3);
    } catch {
      const nextPlan = generatePartyPlan({ templateKey, guests, date, time, streetName });
      setPlan(nextPlan);
      const match = PIZZA_SHOP.items.find((i) => i.name === nextPlan.recommendedPizza) || PIZZA_SHOP.items[2];
      setPizzaItem({ ...match, shopName: PIZZA_SHOP.name, shopIcon: PIZZA_SHOP.icon, quantity: 1 });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTexts = async () => {
    const phones = notifyPhones
      .split(/[\n,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!phones.length) {
      setNotifyStatus({ ok: false, message: "Add at least one phone number." });
      return;
    }
    setLoading(true);
    setNotifyStatus(null);
    try {
      const res = await fetch(`${API_URL}/party-planner/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streetId,
          streetName,
          message: plan?.notifyMessage,
          phones,
        }),
      });
      const data = await res.json();
      setNotifyStatus({
        ok: data.success,
        message: data.message || (data.success ? `Sent ${data.sent} text invites.` : "Could not send texts."),
      });
    } catch {
      setNotifyStatus({ ok: false, message: "Texts could not be sent right now. Copy the message and send manually." });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (!plan) return;
    const partnerShopItems = pizzaItem
      ? [
          {
            ...pizzaItem,
            shopId: PIZZA_SHOP.id,
            shopName: PIZZA_SHOP.name,
          },
        ]
      : [];
    onPublish({
      title: plan.title,
      date: plan.date,
      time: plan.time.length === 5 ? `${plan.time} PM` : plan.time,
      description: plan.description,
      type: plan.type,
      needsFunding: true,
      fundingGoal: plan.fundingGoal,
      fundingDescription: plan.fundingDescription,
      partnerShopItems,
      aiPlanned: true,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
        <div className="relative bg-white border border-slate-200 shadow-xl max-w-lg w-full rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">Party in a box</p>
              <h3 className="font-display text-xl font-semibold text-slate-900">AI block party planner</h3>
              <p className="text-sm text-slate-500 mt-1">Plan the event, pizza, and neighbor texts in minutes.</p>
            </div>
            <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
              &times;
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Pick a template. We will draft the event, funding goal, and invite text.</p>
              <div className="grid grid-cols-2 gap-3">
                {PARTY_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTemplateKey(t.key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      templateKey === t.key
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <p className="font-medium text-slate-900 text-sm mt-2">{t.label}</p>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full btn-party">
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected guests</label>
                <input
                  type="number"
                  min={8}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="input-party"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-party" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-party" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-party-outline flex-1">
                  Back
                </button>
                <button type="button" onClick={buildPlan} disabled={loading} className="btn-party flex-1 disabled:opacity-60">
                  {loading ? "Building plan…" : "Generate plan"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && plan && (
            <div className="space-y-4">
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-900">{plan.title}</p>
                <p className="text-slate-600">{plan.description}</p>
                <p className="text-slate-500">
                  {plan.date} · {plan.time} · Goal ${plan.fundingGoal}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">🍕 Pizza checkout (local partners)</p>
                {pizzaItem && (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{pizzaItem.name}</p>
                      <p className="text-xs text-slate-500">{PIZZA_SHOP.name} · {pizzaItem.serves}</p>
                    </div>
                    <p className="font-semibold text-slate-900">${pizzaItem.price.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">Text neighbors (one per line)</p>
                <textarea
                  value={notifyPhones}
                  onChange={(e) => setNotifyPhones(e.target.value)}
                  rows={3}
                  placeholder="5551234567&#10;5559876543"
                  className="input-party text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">We will text your invite. Neighbors can RSVP in the hub.</p>
                <button
                  type="button"
                  onClick={handleSendTexts}
                  disabled={loading}
                  className="mt-2 w-full py-2 text-sm font-medium rounded-full border border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                >
                  Send text invites
                </button>
                {notifyStatus && (
                  <p className={`text-xs mt-2 ${notifyStatus.ok ? "text-emerald-700" : "text-amber-700"}`}>
                    {notifyStatus.message}
                  </p>
                )}
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-indigo-600 font-medium">Organizer checklist</summary>
                <ul className="mt-2 space-y-1 text-slate-600 list-disc pl-5">
                  {plan.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <p className="text-xs text-slate-500 rounded-lg bg-slate-50 p-3">
                Block decisions (approvals, pinned posts) use neighbor voting on your hub, not a single admin.
              </p>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-party-outline flex-1">
                  Back
                </button>
                <button type="button" onClick={handlePublish} className="btn-party flex-1">
                  Publish to block
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { PIZZA_SHOP };
export default PartyPlannerModal;
