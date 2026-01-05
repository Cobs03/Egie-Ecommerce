import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaCookie, FaChartLine, FaBullhorn, FaUsers, FaRobot, FaEnvelope, FaCreditCard, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

const ConsentTab = ({ loading, setLoading }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [consents, setConsents] = useState({
    marketing: true,
    analytics: true,
    personalization: true,
    thirdPartySharing: false,
    cookies: true,
    research: false,
    // Third-party specific consents
    aiAssistant: false,
    emailService: true,
    paymentProcessing: true // Always true, required for service
  });

  useEffect(() => {
    if (user) {
      loadConsents();
    }
  }, [user]);

  const loadConsents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_consents')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data && data.user_consents) {
        setConsents(data.user_consents);
      }
    } catch (error) {
      console.error('Error loading consents:', error);
    }
  };

  const handleConsentChange = (consentType) => {
    setConsents(prev => ({
      ...prev,
      [consentType]: !prev[consentType]
    }));
  };

  const handleSaveConsents = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Save consents to profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          user_consents: consents,
          consents_updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log consent changes in consent audit table if it exists
      try {
        await supabase
          .from('user_consent_audit')
          .insert({
            user_id: user.id,
            consents: consents,
            ip_address: null, // Could be populated from backend
            user_agent: navigator.userAgent
          });
      } catch (auditError) {
        console.log('Consent audit table not available:', auditError);
      }

      setMessage("Your consent preferences have been saved successfully!");
      setTimeout(() => setMessage(""), 5000);

    } catch (error) {
      console.error('Error saving consents:', error);
      setError("Failed to save your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const consentOptions = [
    {
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Allow us to send you promotional emails, product recommendations, and special offers.',
      icon: <FaBullhorn className="text-2xl" />,
      color: 'orange',
      required: false
    },
    {
      id: 'analytics',
      title: 'Analytics & Performance',
      description: 'Help us improve our website by allowing analytics tools to track your usage patterns.',
      icon: <FaChartLine className="text-2xl" />,
      color: 'blue',
      required: false
    },
    {
      id: 'personalization',
      title: 'Personalized Experience',
      description: 'Use your data to personalize product recommendations and customize your shopping experience.',
      icon: <FaUsers className="text-2xl" />,
      color: 'purple',
      required: false
    },
    {
      id: 'cookies',
      title: 'Non-Essential Cookies',
      description: 'Allow non-essential cookies for enhanced features. Essential cookies are always enabled.',
      icon: <FaCookie className="text-2xl" />,
      color: 'yellow',
      required: false
    },
    {
      id: 'thirdPartySharing',
      title: 'Third-Party Data Sharing',
      description: 'Allow sharing your data with trusted partners for improved services.',
      icon: <FaUsers className="text-2xl" />,
      color: 'red',
      required: false
    },
    {
      id: 'research',
      title: 'Research & Development',
      description: 'Use anonymized data for research to improve our products and services.',
      icon: <FaChartLine className="text-2xl" />,
      color: 'green',
      required: false
    }
  ];

  const thirdPartyConsentOptions = [
    {
      id: 'aiAssistant',
      title: 'AI Shopping Assistant (Groq AI)',
      description: 'Enable AI-powered chat and product recommendations. Chat messages are processed in the United States.',
      icon: <FaRobot className="text-2xl" />,
      color: 'indigo',
      required: false,
      dataShared: ['Chat messages', 'Product preferences', 'Session data'],
      location: 'United States',
      service: 'Groq, Inc.',
      privacyPolicy: 'https://groq.com/privacy-policy/'
    },
    {
      id: 'emailService',
      title: 'Email Service (Resend)',
      description: 'Transactional emails for order confirmations and account notifications.',
      icon: <FaEnvelope className="text-2xl" />,
      color: 'blue',
      required: true, // Required for service
      dataShared: ['Email address', 'Name', 'Order details'],
      location: 'United States (AWS)',
      service: 'Resend',
      privacyPolicy: 'https://resend.com/legal/privacy-policy'
    },
    {
      id: 'paymentProcessing',
      title: 'Payment Processing (PayMongo)',
      description: 'Secure payment processing for credit cards and e-wallets. Required to complete purchases.',
      icon: <FaCreditCard className="text-2xl" />,
      color: 'green',
      required: true, // Required for payments
      dataShared: ['Billing information', 'Payment details', 'Transaction data'],
      location: 'Philippines / Singapore',
      service: 'PayMongo Philippines, Inc.',
      privacyPolicy: 'https://www.paymongo.com/privacy'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Consent Management
      </h2>
      <p className="text-gray-600 mb-6">
        Control how we use your data. You can change these preferences at any time.
      </p>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
          <FaCheckCircle className="mr-2" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <FaTimesCircle className="mr-2" />
          {error}
        </div>
      )}

      {/* General Consent Options */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">General Consents</h3>
        <div className="space-y-4">
          {consentOptions.map((option) => (
            <div
              key={option.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className={`text-${option.color}-600 mr-4 mt-1`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleConsentChange(option.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ml-4 flex-shrink-0 ${
                    consents[option.id] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consents[option.id] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Third-Party Service Consents */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-600" />
          Third-Party Service Consents
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These services may process your data outside of our primary system. Review their privacy policies before consenting.
        </p>
        
        <div className="space-y-4">
          {thirdPartyConsentOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border-2 rounded-lg transition-colors ${
                option.required 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start flex-1">
                  <div className={`text-${option.color}-600 mr-4 mt-1`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-medium text-gray-800">
                        {option.title}
                      </h4>
                      {option.required && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {option.required ? (
                  <div className="ml-4 flex-shrink-0">
                    <FaCheckCircle className="text-2xl text-green-600" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleConsentChange(option.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ml-4 flex-shrink-0 ${
                      consents[option.id] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={option.required ? 'This consent is required for service functionality' : ''}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        consents[option.id] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Service Details */}
              <div className="ml-10 text-xs text-gray-600 space-y-1">
                <div><strong>Service Provider:</strong> {option.service}</div>
                <div><strong>Data Location:</strong> {option.location}</div>
                <div><strong>Data Shared:</strong> {option.dataShared.join(', ')}</div>
                <div>
                  <a 
                    href={option.privacyPolicy} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    View Privacy Policy →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Essential cookies are always enabled and cannot be disabled</li>
          <li>• You can change these settings at any time</li>
          <li>• Some features may not work properly if you disable certain consents</li>
          <li>• We respect your privacy choices and will honor your preferences</li>
        </ul>
      </div>

      {/* Consent Summary */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Your Consent Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(consents).map(([key, value]) => (
            <div key={key} className="flex items-center text-sm">
              {value ? (
                <FaCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FaTimesCircle className="text-gray-400 mr-2" />
              )}
              <span className="capitalize text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setConsents({
              marketing: false,
              analytics: false,
              personalization: false,
              thirdPartySharing: false,
              cookies: false,
              research: false
            });
          }}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95 disabled:bg-gray-100"
        >
          Reject All
        </button>
        <button
          onClick={() => {
            setConsents({
              marketing: true,
              analytics: true,
              personalization: true,
              thirdPartySharing: true,
              cookies: true,
              research: true
            });
          }}
          disabled={loading}
          className="px-6 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 active:scale-95 disabled:bg-gray-100"
        >
          Accept All
        </button>
        <button
          onClick={handleSaveConsents}
          disabled={loading}
          className={`px-6 py-2 rounded-lg transition-all duration-200 active:scale-95 hover:scale-105 ${
            loading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default ConsentTab;
