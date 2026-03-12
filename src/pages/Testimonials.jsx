import React from "react";
import { Link } from "react-router-dom";

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
  {
    quote: "The neighborhood matching was spot-on. We couldn't be happier with our new community.",
    name: "Robert K.",
    location: "Denver, CO",
    avatar: "RK",
  },
  {
    quote: "Found the perfect balance of quiet and social. Exactly what we were looking for!",
    name: "Lisa M.",
    location: "San Francisco, CA",
    avatar: "LM",
  },
  {
    quote: "The detailed neighborhood profiles helped us make the right choice. Highly recommend!",
    name: "Michael D.",
    location: "Chicago, IL",
    avatar: "MD",
  },
];

const Testimonials = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-6 sm:px-10">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Happy Neighbor
              </span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
              What Our Happy Neighbors Say
            </h1>
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
          <div className="text-center mt-12">
            <Link
              to="/survey"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;

