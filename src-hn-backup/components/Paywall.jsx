import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { API_URL } from "../utils/apiConfig";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Initialize Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

// Payment Form Component
const CheckoutForm = ({ onSuccess, onError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Get payment intent from backend
      const response = await fetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount: amount * 100 }), // Convert to cents
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        if (onError) onError(confirmError);
        return;
      }

      // Verify payment on backend
      const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        // Store premium access in localStorage for anonymous users
        // Store payment intent ID for verification
        const expiresAt = verifyData.expiresAt || (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          return date.toISOString();
        })();
        
        localStorage.setItem('premiumAccess', 'true');
        localStorage.setItem('premiumPaymentIntentId', verifyData.paymentIntentId);
        localStorage.setItem('premiumExpiresAt', expiresAt);
        localStorage.setItem('premiumUnlockedAt', new Date().toISOString());
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      if (onError) onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

// Main Paywall Component
const Paywall = ({ onUnlock, remainingCount }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState(null);
  const amount = 10.00;

  const [paywallEmail, setPaywallEmail] = useState("");
  const captureLead = (email) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'paywall' }),
      }).catch(() => {});
    }
  };

  // If Stripe is not configured, show demo mode
  if (!stripePromise || !STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500 rounded-full translate-x-20 translate-y-20"></div>
        </div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-orange-600 mb-2">Your matches are ready — unlock before you lose them</p>
          <div className="text-5xl mb-3">🔒</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock All Your Matches
          </h3>
          <p className="text-gray-700 text-sm mb-1">Join <strong>2,400+</strong> neighbors who found their perfect match</p>
          <p className="text-gray-600 mb-4 text-base">
            Pay <strong>$10</strong> for <strong>unlimited matches for 30 days</strong> — no subscription.
          </p>
          <p className="text-sm text-gray-500 mb-2">
            <span className="line-through text-gray-400">$19</span> <span className="text-orange-600 font-bold">$10 today</span>
          </p>
          <div className="mb-4">
            <input
              type="email"
              value={paywallEmail}
              onChange={(e) => setPaywallEmail(e.target.value)}
              placeholder="Email your matches to"
              className="w-full max-w-xs mx-auto px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 mb-2"
            />
          </div>
          <button
            onClick={() => {
              captureLead(paywallEmail);
              // Demo mode - just unlock for 1 month
              const expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + 1);
              localStorage.setItem('premiumAccess', 'true');
              localStorage.setItem('premiumPaymentIntentId', 'demo-' + Date.now());
              localStorage.setItem('premiumExpiresAt', expiresAt.toISOString());
              localStorage.setItem('premiumUnlockedAt', new Date().toISOString());
              if (onUnlock) onUnlock();
            }}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-base hover:shadow-xl transition-all hover:scale-105 mb-4"
          >
            Unlock Unlimited Matches - $10
          </button>
          
          <p className="text-xs text-gray-500">
            Demo mode • Configure Stripe for real payments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500 rounded-full translate-x-20 translate-y-20"></div>
      </div>
      
      <div className="relative z-10 max-w-lg mx-auto">
        <p className="text-sm font-semibold text-orange-600 mb-2">Your matches are ready — unlock before you lose them</p>
        <div className="text-5xl mb-3">🔒</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Unlock All Your Matches
        </h3>
        <p className="text-gray-700 text-sm mb-1">Join <strong>2,400+</strong> neighbors who found their perfect match</p>
        <p className="text-gray-600 mb-4 text-base">
          Pay <strong>$10</strong> for <strong>unlimited matches for 30 days</strong> — no subscription.
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <span className="line-through text-gray-400">$19</span> <span className="text-orange-600 font-bold">$10 today</span>
        </p>
        <div className="mb-4">
          <input
            type="email"
            value={paywallEmail}
            onChange={(e) => setPaywallEmail(e.target.value)}
            placeholder="Email your matches to"
            className="w-full max-w-xs mx-auto px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
          />
        </div>
        
        {!showPaymentForm ? (
          <button
            onClick={() => {
              captureLead(paywallEmail);
              setShowPaymentForm(true);
            }}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-base hover:shadow-xl transition-all hover:scale-105 mb-4"
          >
            Unlock Unlimited Matches — $10
          </button>
        ) : (
          <div className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-lg border border-gray-100 mb-4">
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                onSuccess={() => {
                  setShowPaymentForm(false);
                  if (onUnlock) onUnlock();
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                }}
                amount={amount}
              />
            </Elements>
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Secure payment • No subscription • Instant access
        </p>
      </div>
    </div>
  );
};

export default Paywall;
