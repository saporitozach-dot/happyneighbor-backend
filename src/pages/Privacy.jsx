import React from "react";
import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Privacy = () => (
  <>
    <Helmet><title>Privacy | Happy Neighbor</title></Helmet>
    <div className="min-h-screen flex flex-col bg-warm-50">
      <Nav />
      <main className="flex-1 w-full max-w-[90rem] mx-auto px-6 lg:px-12 xl:px-16 py-16">
        <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-6">Privacy Policy</h1>
        <p className="text-stone-600 text-sm">
          Your privacy matters. We collect only what&apos;s needed to run your street&apos;s hub. 
          Address data is used to verify residency and connect you with neighbors on your street. 
          We don&apos;t sell your information.
        </p>
      </main>
      <Footer />
    </div>
  </>
);

export default Privacy;
