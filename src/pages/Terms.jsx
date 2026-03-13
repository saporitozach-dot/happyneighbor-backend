import React from "react";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Terms = () => (
  <>
    <Helmet><title>Terms | Happy Neighbor</title></Helmet>
    <div className="min-h-screen flex flex-col bg-warm-50">
      <Nav />
      <main className="flex-1 w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-16">
        <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-6">Terms of Service</h1>
        <p className="text-stone-600 text-sm">
          By using Happy Neighbor, you agree to use it respectfully and for community-building purposes only.
          Misuse may result in loss of access.
        </p>
      </main>
      <Footer />
    </div>
  </>
);

export default Terms;
