import React, { useState } from "react";

const FAQS = [
  {
    q: "How does BlockParty work for my HOA?",
    a: "Your association subscribes with one monthly fee. Every household in the community can verify their address and access your private block hub—events, food ordering, marketplace, and more.",
  },
  {
    q: "Is my address and data private?",
    a: "Yes. Only verified residents of your block or HOA community can see the hub. We don't sell personal data, and posts show house numbers—not full names—to encourage in-person connection.",
  },
  {
    q: "Can we order food for block parties through the app?",
    a: "Absolutely. When you create an event, partner restaurants in your area appear right in the flow. Neighbors can chip in, and orders are tied to your block party—not random delivery addresses.",
  },
  {
    q: "What if our block isn't live yet?",
    a: "Try the demo hub with code DEMO, or contact us to bring BlockParty to your HOA. We're onboarding communities on a rolling basis.",
  },
  {
    q: "How do local businesses get involved?",
    a: "Shops and realtors can partner through our Partners page. Restaurants get featured when blocks in their area plan events—$10/month for local shops.",
  },
];

const FAQSection = ({ className = "" }) => {
  const [open, setOpen] = useState(0);

  return (
    <section className={`py-20 lg:py-28 site-surface ${className}`}>
      <div className="page-container max-w-3xl">
        <div className="text-center mb-12">
          <p className="section-label">FAQ</p>
          <h2 className="section-title">Common questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="glass-card overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-indigo-50/50 transition-colors"
              >
                <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                <span className={`text-indigo-500 text-xl shrink-0 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
