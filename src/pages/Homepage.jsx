import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import AddressAutocomplete from "../components/AddressAutocomplete";
import StatsSection from "../components/StatsSection";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      setError('Enter a valid address (e.g., 123 Main Street, City, State)');
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
        navigate(`/community`, { state: { address: address.trim(), streetData: data } });
        return;
      }
      navigate(`/community/demo`);
    } catch {
      navigate(`/community/demo`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Happy Neighbor – Connect with Your Neighborhood</title>
        <meta
          name="description"
          content="Your street's private community hub. Connect with neighbors, share events, and build closer relationships."
        />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-warm-50">
        <Nav />
        <main className="flex-1">
          {/* Hero with photo */}
          <section className="relative h-[94vh] min-h-[576px]">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src="/images/hero-neighborhood.png"
                alt="Welcoming neighborhood"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-6 lg:px-12 xl:px-16 text-center">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-md max-w-4xl mx-auto text-center leading-tight">
                A neighborhood means more when you know your neighbors.
              </h1>
              <p className="text-white/95 text-base sm:text-lg max-w-2xl mx-auto mb-8 drop-shadow-sm text-center">
                Join your street's community hub—where neighbors share events, lend a hand, and build real relationships.
              </p>
              <form onSubmit={handleLookup} className="w-full max-w-xl mx-auto flex flex-col items-center">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-center sm:items-center">
                  <AddressAutocomplete
                    value={address}
                    onChange={(v) => { setAddress(v); setError(""); }}
                    placeholder="Enter your street address"
                    className="w-full sm:w-72 text-base"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 px-6 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading ? "Finding…" : "Find my street"}
                  </button>
                </div>
                {error && <p className="text-sm text-amber-200 mt-2 text-center w-full">{error}</p>}
                <p className="mt-3 text-sm text-white/80 text-center">Works with any US address.</p>
              </form>
            </div>
            <a
              href="#stats"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll to stats"
            >
              <span className="text-xs font-medium uppercase tracking-wider">See the data</span>
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </section>

          <StatsSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Homepage;
