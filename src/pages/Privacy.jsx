import React from "react";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Privacy = () => (
  <>
    <Helmet>
      <title>Privacy Policy | BlockParty</title>
      <meta name="description" content="BlockParty privacy policy — how we protect your address and neighborhood data." />
    </Helmet>
    <div className="min-h-screen flex flex-col site-surface">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 lg:px-8 py-16">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-6">Privacy policy</h1>
        <div className="glass-card p-8 space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>
            <strong className="text-slate-900">Your privacy matters.</strong> BlockParty collects only what&apos;s needed to run your block&apos;s hub and verify residency.
          </p>
          <p>
            Address data is used to connect you with neighbors on your street and ensure only verified residents access your community. We do not sell your personal information to third parties.
          </p>
          <p>
            Event posts, marketplace listings, and messages are visible to verified members of your block hub. HOA administrators may receive aggregate usage data to manage their subscription.
          </p>
          <p>
            Questions? Contact us at{" "}
            <a href="mailto:hello@blockparty.app" className="text-party hover:underline">hello@blockparty.app</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default Privacy;
