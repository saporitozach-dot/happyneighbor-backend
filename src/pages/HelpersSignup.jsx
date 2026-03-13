import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const HelpersSignup = () => (
  <>
    <Helmet>
      <title>List Your Service | Happy Neighbor</title>
      <meta name="description" content="Offer your service to neighbors for $10/month. Lawn care, snow removal, tech help, and more." />
    </Helmet>
    <div className="min-h-screen flex flex-col bg-warm-50">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 lg:px-12 py-16">
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-4">List your service</h1>
        <p className="text-lg text-stone-600 mb-8">
          Offer your skills to neighbors on your street and nearby. For <strong>$10/month</strong>, you can list a service (lawn mowing, snow removal, tech support, tutoring, etc.) and reach people who already trust their community.
        </p>

        <div className="space-y-6 mb-10">
          <div className="bg-white border border-stone-200 p-6 rounded">
            <h2 className="font-medium text-stone-900 mb-2">What you get</h2>
            <ul className="text-stone-600 text-sm space-y-1">
              <li>• Listed in the Helpers tab in your area's community hub</li>
              <li>• Neighbors see your service, price, and description</li>
              <li>• Reach verified residents on your street and nearby</li>
            </ul>
          </div>
        </div>

        <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded">
          <p className="font-medium text-stone-900 mb-2">$10/month</p>
          <button className="px-8 py-3 bg-leaf text-white font-medium hover:bg-leaf-dark transition-colors">
            Get started
          </button>
          <p className="text-xs text-stone-400 mt-4">Contact us to enroll. Payment setup coming soon.</p>
        </div>

        <p className="mt-10 text-center text-sm text-stone-500">
          <Link to="/community" className="text-leaf hover:text-leaf-dark">← Back to community hub</Link>
        </p>
      </main>
      <Footer />
    </div>
  </>
);

export default HelpersSignup;
