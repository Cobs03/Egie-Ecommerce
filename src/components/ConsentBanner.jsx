import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCookie, FaTimes } from "react-icons/fa";

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already responded to cookie consent
    const consentGiven = localStorage.getItem('cookieConsentGiven');
    if (!consentGiven) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsentGiven', 'true');
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('cookieConsentGiven', 'true');
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleSavePreferences = (preferences) => {
    localStorage.setItem('cookieConsentGiven', 'true');
    localStorage.setItem('cookieConsent', JSON.stringify({
      ...preferences,
      essential: true, // Essential cookies are always enabled
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[600] animate-slide-up">
      <div className="bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {!showDetails ? (
            // Simple Banner View
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <FaCookie className="text-3xl text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    We Use Cookies
                  </h3>
                  <p className="text-sm text-gray-600">
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies.{" "}
                    <Link to="/policy" className="text-green-600 hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
                >
                  Customize
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 active:scale-95"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            // Detailed Preferences View
            <PreferencesPanel
              onSave={handleSavePreferences}
              onBack={() => setShowDetails(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PreferencesPanel = ({ onSave, onBack }) => {
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: true,
    preferences: true
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cookieTypes = [
    {
      id: 'essential',
      title: 'Essential Cookies',
      description: 'Required for basic site functionality. These cannot be disabled.',
      required: true,
      enabled: true
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      required: false,
      enabled: preferences.analytics
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant ads.',
      required: false,
      enabled: preferences.marketing
    },
    {
      id: 'preferences',
      title: 'Preference Cookies',
      description: 'Remember your settings and preferences for a personalized experience.',
      required: false,
      enabled: preferences.preferences
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Cookie Preferences</h3>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {cookieTypes.map((cookie) => (
          <div
            key={cookie.id}
            className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-800">{cookie.title}</h4>
                {cookie.required && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{cookie.description}</p>
            </div>
            
            {!cookie.required && (
              <button
                onClick={() => handleToggle(cookie.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  cookie.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cookie.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
        >
          Back
        </button>
        <button
          onClick={() => onSave(preferences)}
          className="px-6 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 active:scale-95"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
