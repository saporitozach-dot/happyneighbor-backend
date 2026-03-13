import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmailCaptureModal from './EmailCaptureModal';
import { API_URL } from "../utils/apiConfig";

const SaveButton = ({ streetId, streetName, onSaveChange }) => {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && streetId) {
      checkSaved();
    } else {
      // Check localStorage for anonymous users
      const savedStreets = JSON.parse(localStorage.getItem('savedStreets') || '[]');
      setSaved(savedStreets.includes(streetId));
    }
  }, [streetId, isAuthenticated]);

  const checkSaved = async () => {
    try {
      const response = await fetch(`${API_URL}/streets/${streetId}/saved`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSaved(data.saved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const doSave = (withEmail) => {
    const savedStreets = JSON.parse(localStorage.getItem('savedStreets') || '[]');
    savedStreets.push(streetId);
    localStorage.setItem('savedStreets', JSON.stringify(savedStreets));
    setSaved(true);
    if (withEmail) {
      fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: withEmail, source: 'save_favorite', streetIds: [streetId] }),
      }).catch(() => {});
    }
    if (onSaveChange) onSaveChange(true);
  };

  const [limitError, setLimitError] = useState(null);

  const handleSave = async () => {
    setLimitError(null);
    if (!isAuthenticated) {
      const savedStreets = JSON.parse(localStorage.getItem('savedStreets') || '[]');
      if (saved) {
        const updated = savedStreets.filter(id => id !== streetId);
        localStorage.setItem('savedStreets', JSON.stringify(updated));
        setSaved(false);
        if (onSaveChange) onSaveChange(false);
        return;
      }
      if (savedStreets.length >= 3) {
        setLimitError('Sign in to save more streets (free accounts can save up to 3).');
        return;
      }
      // Anonymous + saving: show email capture to track
      setShowEmailModal(true);
      return;
    }

    setLoading(true);
    try {
      const method = saved ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/streets/${streetId}/save`, {
        method,
        credentials: 'include',
      });

      if (response.ok) {
        setSaved(!saved);
        if (onSaveChange) onSaveChange(!saved);
      } else if (response.status === 402) {
        const data = await response.json();
        setLimitError(data.error || 'Free accounts can save up to 3 streets. Upgrade to save more.');
      }
    } catch (error) {
      console.error('Error saving street:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {limitError && (
        <p className="absolute left-0 right-0 top-full mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded whitespace-nowrap z-10">
          {limitError}
        </p>
      )}
      {showEmailModal && (
        <EmailCaptureModal
          title="Save this street"
          subtitle="Enter your email and we'll save it to your favorites. We'll also send you your matches."
          submitLabel="Save"
          skipLabel="Save without email"
          source="save_favorite"
          streetIds={[streetId]}
          onComplete={(email) => {
            setShowEmailModal(false);
            doSave(email);
          }}
          onSkip={() => {
            setShowEmailModal(false);
            doSave(null);
          }}
        />
      )}
    <button
      onClick={handleSave}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        saved
          ? 'bg-orange-500 text-white hover:bg-orange-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title={saved ? 'Remove from saved' : 'Save street'}
    >
      {saved ? '✓ Saved' : 'Save'}
    </button>
    </div>
  );
};

export default SaveButton;


