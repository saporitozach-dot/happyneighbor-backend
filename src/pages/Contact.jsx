import React from "react";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Contact = () => (
  <>
    <Helmet><title>Contact | Happy Neighbor</title></Helmet>
    <div className="min-h-screen flex flex-col bg-warm-50">
      <Nav />
      <main className="flex-1 w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-16">
        <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-6">Contact</h1>
        <p className="text-stone-600 mb-4">
          Questions or feedback? We&apos;d love to hear from you.
        </p>
        <p className="text-stone-500 text-sm">
          Email: support@communityhub.example
        </p>
      </main>
      <Footer />
    </div>
  </>
);

export default Contact;
