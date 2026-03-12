import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const { loginWithEmail, registerWithEmail, isAuthenticated, loading, error: authError, setError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/profile');
    }
  }, [isAuthenticated, loading, navigate, searchParams]);

  useEffect(() => {
    setError?.(null);
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const result = await loginWithEmail(formData.email.trim(), formData.password);
        if (result.success) {
          const redirect = searchParams.get('redirect');
          navigate(redirect || '/profile');
        }
      } else {
        const result = await registerWithEmail(
          formData.email.trim(),
          formData.password,
          formData.fullName.trim(),
          formData.address.trim() || undefined
        );
        if (result.success) {
          navigate('/profile');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center px-4">
      <Helmet>
        <title>Login - Happy Neighbor</title>
        <meta name="description" content="Sign in to Happy Neighbor to save streets, track preferences, and access your Community Hub" />
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
            <p className="text-gray-600 mt-2">
              {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register' ? 'bg-white text-orange-600 shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                {authError || 
                  error === 'linkedin_failed' ? 'LinkedIn authentication failed. Please try again.' :
                  error === 'no_code' ? 'Authentication provider did not return an authorization code.' :
                  error === 'token_exchange_failed' ? 'Failed to exchange authorization code.' :
                  error === 'session_failed' ? 'Failed to create session.' :
                  'An error occurred. Please try again.'}
              </p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required={mode === 'register'}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                minLength={mode === 'register' ? 6 : undefined}
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Address (optional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Link your Community Hub access when verified</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || submitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">One account for everything</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Save up to 3 streets for free</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Track your neighborhood preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Access Community Hub when verified</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">✓</span>
              <span>Same login for home seekers & residents</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
