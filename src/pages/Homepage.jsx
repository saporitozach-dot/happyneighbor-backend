import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import AddressAutocomplete from "../components/AddressAutocomplete";
import StatsSection from "../components/StatsSection";
import { API_URL } from "../utils/apiConfig";

const Homepage = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError("Enter your street address");
      return;
    }
    const pattern = /^\d+\s+\w+/;
    if (!pattern.test(address.trim())) {
      setError("Enter a valid address (e.g., 123 Main Street, City, State)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/lookup-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      if (data.success && data.street?.id) {
        navigate("/community", { state: { address: address.trim(), streetData: data } });
        return;
      }
      navigate("/community/demo");
    } catch {
      navigate("/community/demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>BlockParty – Your HOA&apos;s neighborhood hub</title>
        <meta
          name="description"
          content="BlockParty helps HOA communities plan block parties, order local food, and connect neighbors—all in one vibrant hub."
        />
      </Helmet>
      <div className="flex flex-col">
        {/* Single tall section — one gradient, one blob field, no visual breaks */}
        <section className="home-canvas page-hero">
          <Nav overlay />
          <div className="home-canvas-blobs" aria-hidden>
            <div className="liquid-blob w-[32rem] h-[32rem] bg-violet-500 -top-24 -left-32 animate-float" />
            <div className="liquid-blob w-96 h-96 bg-cyan-400 top-[28%] -right-24 animate-float" style={{ animationDelay: "1.5s" }} />
            <div className="liquid-blob w-80 h-80 bg-fuchsia-500 top-[52%] left-[8%] opacity-35 animate-float" style={{ animationDelay: "3s" }} />
            <div className="liquid-blob w-[28rem] h-[28rem] bg-indigo-500 top-[78%] right-[12%] opacity-30 animate-float" style={{ animationDelay: "2s" }} />
          </div>

          <div className="home-canvas-flow">
            <div className="home-canvas-hero">
              <div className="relative z-10 w-full max-w-4xl mx-auto px-5 lg:px-8 text-center animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-8 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Built for HOAs &amp; close-knit blocks
                </div>
                <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold mb-6 leading-[1.1] tracking-tight">
                  Your block deserves a{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300">
                    BlockParty
                  </span>
                </h1>
                <p className="hero-subtitle text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                  Plan parties, order local food to the curb, and meet the neighbors behind every door—your HOA&apos;s hub for a more vibrant community.
                </p>

                <form onSubmit={handleLookup} className="max-w-xl mx-auto">
                  <div className="rounded-3xl p-2 bg-white/95 backdrop-blur-md shadow-card border border-white/80 flex flex-col sm:flex-row gap-2">
                    <AddressAutocomplete
                      value={address}
                      onChange={(v) => { setAddress(v); setError(""); }}
                      placeholder="123 Main Street, City, State"
                      className="flex-1 !rounded-2xl !border-0 !bg-slate-50/80 !shadow-none focus:!ring-2 focus:!ring-indigo-400/40"
                      disabled={loading}
                    />
                    <button type="submit" disabled={loading} className="btn-party shrink-0 whitespace-nowrap !rounded-2xl sm:!rounded-full">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Finding…
                        </span>
                      ) : "Find my block"}
                    </button>
                  </div>
                  {error && <p className="text-sm text-amber-200 mt-3">{error}</p>}
                  <p className="mt-4 text-sm text-slate-400">
                    Any US address · Demo available if your block isn&apos;t live yet
                  </p>
                </form>

                <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                  <Link to="/community/demo" className="text-white/80 hover:text-white transition-colors">
                    Explore demo hub →
                  </Link>
                <Link to="/how-it-works" className="text-white/80 hover:text-white transition-colors">
                  How it works →
                </Link>
                <Link to="/register-block" className="text-white/80 hover:text-white transition-colors">
                  Register your block →
                </Link>
                </div>
              </div>

              <a
                href="#discover"
                className="home-canvas-scroll absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white"
                aria-label="Scroll to see more"
              >
                <span className="text-xs font-medium tracking-wide uppercase">Scroll</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm animate-bounce">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </a>
            </div>

            <StatsSection variant="home" embedded />
          </div>
        </section>

        <div className="home-footer-bridge">
          <Footer compact />
        </div>
      </div>
    </>
  );
};

export default Homepage;
