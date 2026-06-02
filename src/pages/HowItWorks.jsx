import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const steps = [
  {
    title: "Find your block",
    body: "Enter your home address. If your neighborhood is on BlockParty, you go straight to your hub. If not, try the demo or reach out and we will help get your block set up.",
  },
  {
    title: "Verify your address",
    body: "Complete a quick check so only people who live on the block can see posts and events. Your neighborhood stays private and local.",
  },
  {
    title: "Connect on the block",
    body: "Plan parties, order food from local partners, use the marketplace, and ask neighbors for help. Everything stays on your street, not on a public social feed.",
  },
];

const HowItWorks = () => (
  <>
    <Helmet>
      <title>How It Works | BlockParty</title>
      <meta
        name="description"
        content="How BlockParty helps neighborhoods plan block parties, order local food, and stay connected."
      />
    </Helmet>
    <div className="min-h-screen flex flex-col site-surface">
      <Nav />
      <PageHero
        label="How it works"
        title="Your block, one hub"
        subtitle="BlockParty gives your neighborhood a private place for parties, local food, and everyday neighbor connection."
      />
      <main className="flex-1 page-container max-w-3xl py-10 lg:py-14 -mt-8 relative z-10 pb-16">
        <div className="glass-card p-8 lg:p-10">
          <ol className="list-none space-y-8 m-0 p-0">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-display font-bold text-sm shadow-md">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">{s.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/community" className="btn-party text-center">
              Find my block
            </Link>
            <Link to="/community/demo" className="btn-party-outline text-center">
              Try the demo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  </>
);

export default HowItWorks;
