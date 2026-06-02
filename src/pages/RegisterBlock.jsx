import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { API_URL } from "../utils/apiConfig";

const REPORT_ITEMS = [
  "Verified households on your block",
  "Events hosted and attendance",
  "Local food ordered through the hub",
  "Marketplace and helper activity",
  "Neighborhood vibe trends from join surveys",
];

const RegisterBlock = () => {
  const [form, setForm] = useState({
    block_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    street_address: "",
    city: "",
    state: "",
    household_count: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/block-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Registration failed");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register Your Block | BlockParty</title>
        <meta
          name="description"
          content="Register your block on BlockParty. Get the party planner, verified neighbor hub, and monthly block reports."
        />
      </Helmet>
      <div className="min-h-screen flex flex-col site-surface">
        <Nav />
        <PageHero
          label="Register your block"
          title="Launch BlockParty on your street"
          subtitle="Party planning, neighbor texts, pizza to the curb, and monthly reports that show your block is coming back together."
        />
        <main className="flex-1 page-container max-w-4xl py-10 lg:py-14 -mt-8 relative z-10 pb-16">
          {!done ? (
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6">
                  <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">What you get</h2>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <span className="text-indigo-600">✓</span>
                      <span>
                        <strong className="text-slate-800">AI party planner</strong> with pizza checkout and text
                        invites to neighbors
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600">✓</span>
                      <span>
                        <strong className="text-slate-800">Private block hub</strong> for events, food, marketplace,
                        and tasks
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600">✓</span>
                      <span>
                        <strong className="text-slate-800">Neighborhood vibe surveys</strong> when people join (what
                        Zillow does not show)
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-6">
                  <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">Monthly block reports</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Every month you get a simple report you can share with neighbors or your board: proof the block is
                    more connected.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {REPORT_ITEMS.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-indigo-500 shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-6 border-indigo-200/80 bg-indigo-50/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">Pricing</p>
                  <p className="font-display text-3xl font-bold text-slate-900">
                    $79<span className="text-lg font-medium text-slate-500">/month</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Per block. All verified households included.</p>
                  <p className="text-xs text-slate-500 mt-3">
                    We will confirm details and send payment setup after review. No charge until your block is live.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="lg:col-span-3 glass-card p-8 space-y-4">
                <h2 className="font-display text-xl font-semibold text-slate-900">Register your block</h2>
                <p className="text-sm text-slate-600 -mt-2">
                  Tell us about your neighborhood. We will reach out within 1 to 2 business days.
                </p>

                {[
                  { name: "block_name", label: "Block or neighborhood name", required: true, placeholder: "Maple Street" },
                  { name: "contact_name", label: "Your name", required: true },
                  { name: "contact_email", label: "Email", required: true, type: "email" },
                  { name: "contact_phone", label: "Phone", placeholder: "(555) 123-4567" },
                  { name: "street_address", label: "Main street or area", required: true },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </label>
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      required={field.required}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="input-party"
                    />
                  </div>
                ))}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    <input name="city" required value={form.city} onChange={handleChange} className="input-party" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                    <input name="state" required value={form.state} onChange={handleChange} className="input-party" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Approx. households</label>
                  <input
                    type="number"
                    name="household_count"
                    min={5}
                    value={form.household_count}
                    onChange={handleChange}
                    placeholder="40"
                    className="input-party"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Anything else?</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    className="input-party"
                    placeholder="HOA, property manager, target launch date…"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={submitting} className="w-full btn-party disabled:opacity-60">
                  {submitting ? "Submitting…" : "Request to register block"}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card p-10 text-center max-w-lg mx-auto">
              <p className="text-4xl mb-4">🎉</p>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">We got your request</h2>
              <p className="text-slate-600 mb-6">
                Thanks for registering {form.block_name}. We will email {form.contact_email} with next steps and payment
                setup.
              </p>
              <Link to="/" className="btn-party">
                Back to home
              </Link>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RegisterBlock;
