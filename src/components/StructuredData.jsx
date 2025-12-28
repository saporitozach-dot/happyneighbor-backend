import React from 'react';

export const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Happy Neighbor",
    "description": "Match with communities that fit your lifestyle, personality, and preferences. Get transparent neighborhood vibes before you move.",
    "url": "https://happyneighbor.com",
    "applicationCategory": "RealEstateApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

