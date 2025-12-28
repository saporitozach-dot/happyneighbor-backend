// Vite + React + TailwindCSS Project: Happy Neighbor

// FILE: package.json
/*
{
  "name": "happy-neighbor",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.4.1",
    "vite": "^4.3.9"
  }
}
*/

// FILE: tailwind.config.cjs
/*
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6dbf61',
        accent: '#ffe89e',
        secondary: '#f7faf9',
        neutral: '#f5f5f4',
        gold: '#ffeb8a',
        olive: '#e3eede',
        "soft-green": '#e8f9e6',
      }
    }
  },
  plugins: [],
}
*/

// FILE: postcss.config.cjs
/*
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
*/

// FILE: index.html
/*
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <meta name="description" content="Find your perfect neighborhood match based on lifestyle, community vibe, and preferences." />
    <title>Happy Neighbor</title>
    <link rel="icon" href="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3e0.png" />
  </head>
  <body class="bg-secondary min-h-screen antialiased text-neutral-900">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
*/

// FILE: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// FILE: src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
body {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

// FILE: src/App.jsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import VibesSection from "./components/VibesSection";
import WhyItMatters from "./components/WhyItMatters";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <HowItWorks />
        <VibesSection />
        <WhyItMatters />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

// FILE: src/components/Navbar.jsx
import React, { useState } from "react";

const links = [
  { name: "How It Works", href: "#how" },
  { name: "Neighborhood Vibes", href: "#vibes" },
  { name: "About", href: "#about" },
  { name: "Sign In", href: "#signin" },
  { name: "Get Started", href: "#getstarted", cta: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full bg-white shadow-md z-30 sticky top-0">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <a href="#" className="font-extrabold text-2xl text-primary flex items-center gap-2">
          <span role="img" aria-label="house" className="inline-block">🏡</span>
          Happy Neighbor
        </a>
        <button
          className="md:hidden p-2 rounded-lg focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open Menu"
        >
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
        <div className="hidden md:flex gap-5 items-center">
          {links.map((l) =>
            l.cta ? (
              <a
                key={l.name}
                href={l.href}
                className="bg-primary text-white rounded-lg px-4 py-2 font-semibold hover:bg-lime-500 transition"
              >
                {l.name}
              </a>
            ) : (
              <a
                key={l.name}
                href={l.href}
                className="text-neutral-700 font-medium hover:text-primary transition"
              >
                {l.name}
              </a>
            )
          )}
        </div>
      </div>
      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="flex flex-col gap-1 py-2 px-5">
            {links.map((l) =>
              l.cta ? (
                <a
                  key={l.name}
                  href={l.href}
                  className="bg-primary text-white rounded-lg px-4 py-2 font-semibold mt-1 mb-2 hover:bg-lime-600 transition"
                  onClick={() => setOpen(false)}
                >
                  {l.name}
                </a>
              ) : (
                <a
                  key={l.name}
                  href={l.href}
                  className="py-2 font-medium text-neutral-700 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {l.name}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// FILE: src/components/Hero.jsx
import React from "react";

export default function Hero() {
  return (
    <section className="w-full bg-soft-green py-16 px-4" id="hero">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 flex flex-col items-start text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 text-emerald-700">
            Find a neighborhood that fits your lifestyle.
          </h1>
          <p className="text-lg md:text-xl mb-6 text-emerald-900/80 font-medium">
            Match with communities based on social vibe, noise level, families, cookouts, and more.
          </p>
          <a
            href="#getstarted"
            className="bg-primary hover:bg-lime-600 text-white rounded-xl px-7 py-3 font-bold text-lg shadow-md mb-4 transition-all"
          >
            Start Your Match
          </a>
        </div>
        {/* Preference Card */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white border-2 border-soft-green shadow-lg rounded-2xl px-8 py-7 min-w-[260px]">
            <div className="text-green-700 font-semibold text-lg mb-3 flex items-center gap-2">
              <span role="img" aria-label="star">✨</span>
              Example Preferences
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl" role="img" aria-label="bbq">🍔</span>
                <span className="font-medium text-neutral-900">Cookouts: <span className="text-neutral-600">Often</span></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-fuchsia-500 text-xl" role="img" aria-label="ear">🔊</span>
                <span className="font-medium text-neutral-900">Noise Level: <span className="text-neutral-600">Low–Medium</span></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 text-xl" role="img" aria-label="kids">🧒🏾</span>
                <span className="font-medium text-neutral-900">Kids: <span className="text-neutral-600">Many families</span></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400 text-xl" role="img" aria-label="calendar">📅</span>
                <span className="font-medium text-neutral-900">Community Events: <span className="text-neutral-600">Active</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// FILE: src/components/HowItWorks.jsx
import React from "react";

const steps = [
  {
    emoji: "📝",
    title: "Share Preferences",
    desc: "Choose your ideal social vibe, noise level, child-friendliness, and more.",
  },
  {
    emoji: "🔎",
    title: "We Analyze Neighborhoods",
    desc: "Our data crunches housing, community, and resident insight for real matches.",
  },
  {
    emoji: "🤝",
    title: "Get Matched",
    desc: "We find your top neighborhoods and show their unique vibe profiles.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-16 px-4 bg-white" id="how">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center text-emerald-600">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex-1 bg-neutral rounded-2xl shadow p-7 flex flex-col items-center text-center border border-olive"
            >
              <div className="text-4xl md:text-5xl mb-4">{step.emoji}</div>
              <div className="font-bold text-lg mb-2 text-emerald-700">{step.title}</div>
              <div className="text-neutral-700 opacity-90">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FILE: src/components/VibesSection.jsx
import React from "react";

const vibes = [
  {
    icon: "🔥",
    title: "Backyard BBQ & Social",
    desc: "Frequent cookouts, block parties, and neighborly get-togethers.",
    tags: ["Kid-friendly", "Active Socials", "Low–Medium Noise"],
    color: "bg-orange-50",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    icon: "🦉",
    title: "Quiet & Family-Focused",
    desc: "Calm streets, lots of families, peaceful evenings.",
    tags: ["Many families", "Low noise", "Safe"],
    color: "bg-emerald-50",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "⚡",
    title: "Energetic & Young Crowd",
    desc: "Young professionals, vibrant nights, group activities.",
    tags: ["Lively", "Walkable", "Social Events"],
    color: "bg-pink-50",
    tagColor: "bg-pink-100 text-pink-700",
  },
  {
    icon: "🚇",
    title: "Urban & On-the-Go",
    desc: "Fast-paced, amenities close, city adventures abound.",
    tags: ["Transit-access", "Convenience", "Dynamic"],
    color: "bg-yellow-50",
    tagColor: "bg-yellow-100 text-yellow-700",
  },
];

export default function VibesSection() {
  return (
    <section className="w-full py-16 px-4" id="vibes">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 text-emerald-600">
          Neighborhood Vibes
        </h2>
        <div className="grid gap-7 md:grid-cols-2">
          {vibes.map((vibe) => (
            <div
              key={vibe.title}
              className={`rounded-2xl shadow-md border border-olive p-6 flex flex-col ${vibe.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{vibe.icon}</span>
                <div className="font-bold text-lg text-emerald-800">{vibe.title}</div>
              </div>
              <div className="mt-2 mb-3 text-neutral-800">{vibe.desc}</div>
              <div className="flex flex-wrap gap-2">
                {vibe.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${vibe.tagColor}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FILE: src/components/WhyItMatters.jsx
import React from "react";

export default function WhyItMatters() {
  return (
    <section className="w-full py-16 px-4 bg-white" id="about">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-5 text-emerald-700">
            Why Neighborhood Vibe Matters
          </h2>
          <p className="text-neutral-800 text-lg mb-5">
            A home isn’t just a building—it’s a lifestyle. Whether you long for quiet streets or crave weekend gatherings, finding the right neighborhood means more connection, less compromise, and a place your family truly belongs.
          </p>
          <ul className="space-y-3 text-neutral-700 pl-3">
            <li>• Boost your happiness and sense of belonging</li>
            <li>• Find like-minded neighbors and a community that matches you</li>
            <li>• Avoid mismatches that lead to “move regret”</li>
          </ul>
        </div>
        {/* Stat Box */}
        <div className="flex items-center justify-center">
          <div className="bg-accent/70 rounded-2xl shadow-md border border-yellow-200 p-8 min-w-[220px] w-full max-w-xs flex flex-col items-center">
            <div className="font-bold text-3xl mb-2 text-yellow-700">93%</div>
            <div className="text-neutral-800 mb-3 text-center text-lg">of people say “neighborhood vibe” is as important as the house itself.</div>
            <div className="text-xs text-neutral-500">*(Pretend survey placeholder)</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// FILE: src/components/Testimonials.jsx
import React from "react";

const testimonials = [
  {
    name: "Nate W.",
    city: "Columbus, OH",
    quote: "Happy Neighbor helped us find a street where our kids have three friends on the same block.",
  },
  {
    name: "Maya G.",
    city: "Austin, TX",
    quote: "We wanted a quiet area but still social on weekends. The match was spot on.",
  },
  {
    name: "Eli P.",
    city: "Seattle, WA",
    quote: "We love our new neighborhood and didn’t have to guess the vibe—it’s exactly what we hoped for.",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-16 px-4 bg-soft-green" id="testimonials">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center text-emerald-600">
          What Our Happy Neighbors Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, ix) => (
            <div
              key={ix}
              className="bg-white border border-lime-100 rounded-xl shadow p-6 flex flex-col gap-3"
            >
              <blockquote className="text-neutral-800 italic leading-relaxed">“{t.quote}”</blockquote>
              <div className="mt-3 text-lime-700 font-medium text-sm">
                &mdash; {t.name}, {t.city}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FILE: src/components/CTA.jsx
import React from "react";

export default function CTA() {
  return (
    <section className="w-full bg-gold/70 py-14 px-4" id="getstarted">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-700 mb-2 text-center">
          Ready to find your neighborhood?
        </h2>
        <div className="text-emerald-900 text-lg mb-6 text-center">
          Answer a few questions to get matched instantly.
        </div>
        <a
          href="#"
          className="bg-primary hover:bg-lime-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-md focus:ring-2 ring-emerald-200 focus:outline-none transition"
        >
          Start Your Match
        </a>
      </div>
    </section>
  );
}

// FILE: src/components/Footer.jsx
import React from "react";

const links = [
  { name: "About", href: "#about" },
  { name: "Contact", href: "#" },
  { name: "FAQ", href: "#" },
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-amber-100 py-7 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 px-4 text-sm text-neutral-500">
        <div className="flex gap-6 flex-wrap justify-center">
          {links.map((link) => (
            <a
              href={link.href}
              key={link.name}
              className="hover:text-amber-500 transition"
            >
              {link.name}
            </a>
          ))}
        </div>
        <div className="opacity-80 pt-2 sm:pt-0">
          &copy; {new Date().getFullYear()} Happy Neighbor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

