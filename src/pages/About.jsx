import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const founders = [
  { name: "Zach Saporito", role: "Co-Founder", image: "/images/zach-saporito.jpg", linkedin: "https://www.linkedin.com/in/zachsaporito/" },
  { name: "Charlie Fischer", role: "Co-Founder", image: "/images/charlie-fischer.jpg", linkedin: "https://www.linkedin.com/in/charlie-fischer1/" },
];

const About = () => {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>About | BlockParty</title>
        <meta name="description" content="Meet the founders of BlockParty and learn about our mission to restore real human connection in every neighborhood." />
      </Helmet>
      <div className="min-h-screen flex flex-col site-surface">
        <Nav />
        <PageHero
          label="About us"
          title="Bringing blocks back together"
          subtitle="We want to bring back neighborhoods, one household at a time."
        />
        <main className="flex-1 page-container max-w-3xl py-16 lg:py-20 text-center -mt-4 relative z-10">
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-lg mx-auto justify-items-center">
              {founders.map((f) => (
                <div key={f.name} className="glass-card p-6 w-full flex flex-col items-center">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-36 h-36 rounded-full object-cover mb-4 shadow-card ring-4 ring-white"
                  />
                  <h3 className="text-lg font-semibold text-slate-900">{f.name}</h3>
                  <p className="text-party text-sm mb-2 font-medium">{f.role}</p>
                  <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-party text-sm transition-colors">
                    LinkedIn →
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="glass-card p-8 md:p-10 text-center">
              <p className="section-label">Our mission</p>
              <p className="text-lg text-slate-800 leading-relaxed">
                BlockParty&apos;s mission is to <span className="font-semibold text-slate-900">bring back neighborhoods</span> by restoring real human connection, strengthening local economies, and helping people find <span className="font-semibold text-slate-900">communities, not just houses</span>.
              </p>
            </div>
          </section>

          <section className="mb-12 mx-auto max-w-2xl text-left">
            <button
              type="button"
              onClick={() => setStoryOpen(!storyOpen)}
              className="w-full glass-card-hover flex items-center justify-between gap-3 p-5"
            >
              <h2 className="font-display text-lg font-semibold text-slate-900">Our story</h2>
              <span className={`text-party text-xl transition-transform duration-200 ${storyOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {storyOpen && (
              <div className="glass-card rounded-t-none border-t-0 p-6 space-y-4 text-slate-700 leading-relaxed text-sm">
                <p>Zach and Charlie met in college in 2025. What they saw troubled them—screens replacing conversations, neighbors passing without a wave, porches going quiet.</p>
                <p className="font-medium text-slate-900">People use technology most when at home, exactly where community should be strongest.</p>
                <p>So they built BlockParty: technology that gets you off your screen and onto the block—parties, shared meals, and the everyday help that makes a street feel like home.</p>
                <p>Today, BlockParty partners with HOAs and local businesses to support neighborhood gatherings and the shops that show up when it&apos;s time to celebrate.</p>
              </div>
            )}
          </section>

          <Link to="/community" className="btn-party">Find my block</Link>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;
