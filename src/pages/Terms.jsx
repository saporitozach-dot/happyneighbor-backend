import React from "react";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Terms = () => (
  <>
    <Helmet>
      <title>Terms of Service | BlockParty</title>
      <meta name="description" content="BlockParty terms of service for residents, HOAs, and partner businesses." />
    </Helmet>
    <div className="min-h-screen flex flex-col site-surface">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 lg:px-8 py-16">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-6">Terms of service</h1>
        <div className="glass-card p-8 space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>
            By using BlockParty, you agree to use the platform respectfully and for community-building purposes only.
            BlockParty hubs are private to verified residents of each block or HOA community.
          </p>
          <p>
            HOA subscriptions cover access for member households. Individual users must verify their address and comply with community guidelines set by their association.
          </p>
          <p>
            Partner businesses and local helpers must provide accurate listings. BlockParty reserves the right to remove content or suspend access for misuse, harassment, or fraud.
          </p>
          <p>
            For questions about these terms, contact{" "}
            <a href="mailto:hello@blockparty.app" className="text-party hover:underline">hello@blockparty.app</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default Terms;
