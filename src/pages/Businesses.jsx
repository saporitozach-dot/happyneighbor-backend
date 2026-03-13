import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Businesses = () => (
  <>
    <Helmet>
      <title>For Businesses | Happy Neighbor</title>
      <meta name="description" content="Get listed as a one-click food provider for neighborhood events. $20/month to reach communities in your area." />
    </Helmet>
    <div className="min-h-screen flex flex-col bg-warm-50">
      <Nav />
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 lg:px-12 py-16">
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-4">For local businesses</h1>
        <p className="text-lg text-stone-600 mb-8">
          Get in front of neighbors hosting block parties, potlucks, and community events. 
          For <strong>$20/month</strong>, your restaurant or catering business becomes a one-click 
          food provider in community hubs throughout your area.
        </p>

        <div className="space-y-6 mb-12">
          <div className="bg-white border border-stone-200 p-6">
            <h2 className="font-medium text-stone-900 mb-2">What you get</h2>
            <ul className="text-stone-600 space-y-2 text-sm">
              <li>• Listed in the event food picker when neighbors plan gatherings</li>
              <li>• One-click ordering: neighbors add your items (pizza, subs, platters) directly to their event</li>
              <li>• Reach community hubs in your service area</li>
              <li>• Show menu items, prices, and serving sizes</li>
            </ul>
          </div>

          <div className="bg-leaf-pale/40 border border-leaf/20 p-6">
            <h2 className="font-medium text-stone-900 mb-2">Perfect for</h2>
            <p className="text-stone-600 text-sm">
              Pizza shops, sub shops, bakeries, caterers, coffee shops, and any local food business 
              that serves groups. Neighbors hosting events can add your food with one click—no phone calls, 
              no back-and-forth. You get orders; they get easy catering.
            </p>
          </div>
        </div>

        <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded">
          <p className="font-medium text-stone-900 mb-2">$20/month</p>
          <p className="text-sm text-stone-500 mb-6">Enroll your business to appear in community hub event food pickers</p>
          <button className="px-8 py-3 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors">
            Get started — enroll your business
          </button>
          <p className="text-xs text-stone-400 mt-4">Contact us to enroll. Payment setup coming soon.</p>
        </div>

        <p className="mt-12 text-center text-sm text-stone-500">
          Questions? <Link to="/contact" className="text-leaf hover:text-leaf-dark">Contact us</Link>
        </p>
      </main>
      <Footer />
    </div>
  </>
);

export default Businesses;
