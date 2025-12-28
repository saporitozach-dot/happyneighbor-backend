import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { StructuredData } from "../components/StructuredData";

const features = [
  {
    title: "Community Personality Scores",
    description:
      "Get a sense of your neighborhood's friendliness, vibe, and pace with simple scoring.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    gradient: "from-orange-500 to-cyan-500",
  },
  {
    title: "Vibe Heatmaps",
    description:
      "See which areas are quiet, social, lively, or restful, all at a glance.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.513 1.41C21.088 15.48 24 12.513 24 9.75c0-1.37-.56-2.69-1.563-3.618M18.657 3.34A10.5 10.5 0 0115.75 3c-5.798 0-10.5 4.702-10.5 10.5 0 1.19.222 2.33.627 3.38M18.657 3.34l-1.875 1.875m0 0L15.75 7.5m-2.813-2.813L12 6.75m6.75 0l-3.375-3.375M12 6.75V3m0 3.75h3.75M12 6.75H8.25m3.75 0v3.75m0 3.75H8.25m3.75 0v3.75M8.25 18.75h3.75m-3.75 0v-3.75m0-3.75h3.75" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Kid-Friendly Index",
    description:
      "Find streets filled with families, local parks, and safe spaces for children.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Local Events & Cookouts",
    description:
      "Love potlucks or neighborhood BBQs? See who hosts and what's happening nearby.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    gradient: "from-orange-500 to-amber-500",
  },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Share Your Preferences",
    desc: "Tell us about your ideal lifestyle: noise tolerance, sociability, community events, families, walkability, and more.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.75-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "We Analyze the Data",
    desc: "Our algorithm combines local data, resident feedback, and lifestyle indicators to build comprehensive neighborhood profiles.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get Your Perfect Matches",
    desc: "Receive personalized neighborhood recommendations with compatibility scores, detailed pros & cons, and transparent vibe profiles.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: "Happy Neighbor helped us find a street where our kids have friends next door. Best decision we made!",
    name: "Maya & Daniel T.",
    location: "Portland, OR",
    avatar: "MD",
  },
  {
    quote: "Finally found a quiet block close to everything. The vibe score was exactly right.",
    name: "James W.",
    location: "Austin, TX",
    avatar: "JW",
  },
  {
    quote: "I'm loving the weekend cookouts and how social my new neighbors are. Perfect match!",
    name: "Samantha P.",
    location: "Seattle, WA",
    avatar: "SP",
  },
];

const Homepage = () => {
  return (
    <>
      <Helmet>
        <title>Happy Neighbor - Find Your Perfect Neighborhood Match</title>
        <meta name="description" content="Match with communities that fit your lifestyle, personality, and preferences. Get transparent neighborhood vibes before you move. Find your perfect neighborhood today." />
        <meta name="keywords" content="neighborhood matching, find neighborhood, community matching, neighborhood search, lifestyle matching, neighborhood vibes, home buying, neighborhood finder" />
        <meta property="og:title" content="Happy Neighbor - Find Your Perfect Neighborhood Match" />
        <meta property="og:description" content="Match with communities that fit your lifestyle, personality, and preferences. Get transparent neighborhood vibes before you move." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://happyneighbor.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://happyneighbor.com/" />
      </Helmet>
      <StructuredData />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Happy Neighbor" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:inline">
                HappyNeighbor
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/how-it-works" className="text-gray-600 hover:text-orange-600 transition-colors font-medium cursor-pointer relative z-10">
                How It Works
              </Link>
              <Link to="/features" className="text-gray-600 hover:text-orange-600 transition-colors font-medium cursor-pointer relative z-10">
                Features
              </Link>
              <Link to="/submit" className="text-gray-600 hover:text-green-600 transition-colors font-medium cursor-pointer relative z-10">
                Share Your Street
              </Link>
              <Link to="/community/demo" className="text-gray-600 hover:text-orange-600 transition-colors font-medium cursor-pointer relative z-10">
                Community Hub
              </Link>
              <Link to="/survey" className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 cursor-pointer relative z-10">
                Take Survey
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link to="/survey" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all cursor-pointer relative z-10">
                Survey
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/hero-neighborhood.png" 
            alt="HappyNeighbor - Transform your neighborhood search from uncertain to vibrant" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                Find Your Perfect Neighborhood Match
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Find a Neighborhood That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">
                Feels Like Home
              </span>
            </h1>
            <p className="max-w-xl text-xl text-gray-200 mb-10 leading-relaxed drop-shadow-md">
              Match with communities that fit your lifestyle, personality, and preferences. 
              Get transparent neighborhood vibes before you move.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/survey" 
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 hover:from-orange-600 hover:to-amber-600 cursor-pointer"
              >
                Take the Survey
              </Link>
              <Link 
                to="/submit-neighborhood" 
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/40 hover:bg-white/30 transition-all hover:scale-105 cursor-pointer"
              >
                Share Your Neighborhood
              </Link>
              <Link 
                to="/how-it-works" 
                className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to find your perfect neighborhood match
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 group"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>
                <div className="mb-6 w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Discover Your Community's Unique Vibe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get insights into what makes each neighborhood special
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What Our Happy Neighbors Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from people who found their perfect match
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, ix) => (
              <div
                key={ix}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Neighborhood?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of happy neighbors who found their ideal community match
            </p>
            <Link to="/survey" className="inline-block px-10 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer relative z-10">
              Take the Survey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src="/images/logo.png" alt="Happy Neighbor" className="h-10 w-auto" />
                <span className="text-xl font-bold text-white">HappyNeighbor</span>
              </Link>
              <p className="text-gray-400">
                Find your perfect neighborhood match based on lifestyle and community vibes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors cursor-pointer">How It Works</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors cursor-pointer">Features</Link></li>
                <li><Link to="/survey" className="hover:text-white transition-colors cursor-pointer">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition-colors cursor-pointer">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors cursor-pointer">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors cursor-pointer">Terms</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors cursor-pointer">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Happy Neighbor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Homepage;

