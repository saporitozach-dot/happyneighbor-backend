import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const HelpersSignup = () => (
  <>
    <Helmet>
      <title>List Your Service | BlockParty</title>
      <meta name="description" content="Offer your service to neighbors on BlockParty. Lawn care, snow removal, tech help, and more." />
    </Helmet>
    <div className="min-h-screen flex flex-col site-surface">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 lg:px-8 py-16">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-4">List your service</h1>
        <p className="text-lg text-slate-600 mb-8">
          Offer your skills to neighbors on your block. For <strong>$10/month</strong>, list a service—lawn mowing, snow removal, tech support, tutoring, and more—and reach people who already trust their community.
        </p>

        <div className="glass-card p-6 mb-10">
          <h2 className="font-display font-semibold text-slate-900 mb-2">What you get</h2>
          <ul className="text-slate-600 text-sm space-y-2">
            <li className="flex gap-2"><span className="text-party">✓</span> Listed in the Local Helpers tab in your area&apos;s hub</li>
            <li className="flex gap-2"><span className="text-party">✓</span> Neighbors see your service, price, and availability</li>
            <li className="flex gap-2"><span className="text-party">✓</span> Reach verified residents on your block</li>
          </ul>
        </div>

        <div className="glass-card p-8 text-center border-dashed border-2 border-party/30">
          <p className="font-display font-bold text-2xl gradient-text mb-1">$10/month</p>
          <p className="text-slate-500 text-sm mb-6">Per service listing</p>
          <Link to="/contact" className="btn-party">Get started</Link>
          <p className="text-xs text-slate-400 mt-4">Contact us to enroll. Self-serve payment coming soon.</p>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link to="/community" className="text-party hover:text-party-dark">← Back to your block hub</Link>
        </p>
      </main>
      <Footer />
    </div>
  </>
);

export default HelpersSignup;
