import React from "react";
import { Link } from "react-router-dom";

const ProductPreview = () => (
  <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
    <div className="absolute inset-0 bg-mesh-light opacity-60 pointer-events-none" />
    <div className="page-container relative">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="section-label">The block hub</p>
          <h2 className="section-title mb-4">See what your neighbors see</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Every block gets a private hub—events on the calendar, food from local partners, marketplace listings, and a task board. No algorithm, no strangers, just your street.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Summer cookouts with RSVP & chip-in funding",
              "Pizza and catering ordered to the block",
              "Buy, sell, and lend between verified neighbors",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-party-pale text-indigo-600 text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/community/demo" className="btn-party">Explore demo hub</Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div className="bento-card col-span-2 hero-bg text-white border-0 p-6 min-h-[140px] flex flex-col justify-end">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Maple Street · Demo</p>
            <p className="font-display font-bold text-xl">Summer Block Party 🎉</p>
            <p className="text-sm text-white/70 mt-1">Sat Jul 15 · 12 neighbors going</p>
          </div>
          <div className="bento-card">
            <p className="text-xs font-semibold text-indigo-600 uppercase mb-2">Food</p>
            <p className="font-medium text-slate-900 text-sm">Tony&apos;s Pizza</p>
            <p className="text-xs text-slate-500 mt-1">Party pack · $52.99</p>
          </div>
          <div className="bento-card">
            <p className="text-xs font-semibold text-indigo-600 uppercase mb-2">Marketplace</p>
            <p className="font-medium text-slate-900 text-sm">Kids bike · $40</p>
            <p className="text-xs text-slate-500 mt-1">House #247</p>
          </div>
          <div className="bento-card col-span-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Task board</p>
              <p className="text-sm text-slate-800">Need help moving a couch Saturday</p>
            </div>
            <span className="btn-party-sm shrink-0">Offer help</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ProductPreview;
