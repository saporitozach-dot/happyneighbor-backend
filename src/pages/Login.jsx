import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const { loginWithGoogle, loginWithLinkedIn, isAuthenticated, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Check if there's a redirect parameter, otherwise go to profile
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/profile');
    }
  }, [isAuthenticated, loading, navigate, searchParams]);

  const handleLinkedInLogin = () => {
    loginWithLinkedIn();
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center px-4">
      <Helmet>
        <title>Login - Happy Neighbor</title>
        <meta name="description" content="Sign in to Happy Neighbor with LinkedIn to find your perfect neighborhood match" />
      </Helmet>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Happy Neighbor
              </h1>
            </Link>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                {authError ? authError : 
                  error === 'linkedin_failed' ? 'LinkedIn authentication failed. Please try again.' :
                  error === 'google_failed' ? 'Google authentication failed. Please try again.' :
                  error === 'no_code' ? 'Authentication provider did not return an authorization code. Please try again.' :
                  error === 'token_exchange_failed' ? 'Failed to exchange authorization code. Please check your app settings.' :
                  error === 'no_access_token' ? 'Authentication provider did not return an access token. Please try again.' :
                  error === 'profile_fetch_failed' ? 'Failed to fetch your profile. Please try again.' :
                  error === 'no_linkedin_id' ? 'Could not retrieve your LinkedIn ID. Please try again.' :
                  error === 'session_failed' ? 'Failed to create session. Please try again.' :
                  error === 'callback_error' ? 'An error occurred during authentication. Please try again.' :
                  'An error occurred. Please try again.'}
              </p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* LinkedIn Login Button */}
          <button
            onClick={handleLinkedInLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0077b5] hover:bg-[#005885] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            {loading ? 'Connecting...' : 'Continue with LinkedIn'}
          </button>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-orange-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-orange-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why sign in?
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Save your neighborhood preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Get personalized recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Track your favorite neighborhoods</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Access your match history</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
