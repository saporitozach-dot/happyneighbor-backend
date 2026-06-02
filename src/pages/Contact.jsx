import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", type: "hoa", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`BlockParty inquiry: ${form.type}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nType: ${form.type}\n\n${form.message}`);
    window.location.href = `mailto:hello@blockparty.app?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact | BlockParty</title>
        <meta name="description" content="Get in touch with BlockParty for HOA pricing, partnerships, or support." />
      </Helmet>
      <div className="min-h-screen flex flex-col site-surface">
        <Nav />
        <PageHero
          label="Contact"
          title="Let's talk"
          subtitle="HOA board member, local business, or curious neighbor—we'd love to hear from you."
        />
        <main className="flex-1 page-container max-w-lg py-12 lg:py-16 -mt-4 relative z-10">
          {sent ? (
            <div className="glass-card p-8 text-center">
              <div className="icon-badge mx-auto mb-4 text-2xl">✉️</div>
              <p className="text-slate-900 font-semibold mb-2">Opening your email client…</p>
              <p className="text-slate-600 text-sm">
                Or write us at{" "}
                <a href="mailto:hello@blockparty.app" className="text-party hover:underline">hello@blockparty.app</a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-6 lg:p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input required className="input-party" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" required className="input-party" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a…</label>
                <select className="input-party" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="hoa">HOA / community manager</option>
                  <option value="resident">Resident</option>
                  <option value="business">Local business partner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea required rows={4} className="input-party resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-party w-full">Send message</button>
            </form>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
