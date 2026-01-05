import React from "react";
import { FaShieldAlt, FaRobot, FaEnvelope, FaCreditCard, FaDatabase, FaExternalLinkAlt } from "react-icons/fa";

const ThirdPartyComplianceTab = () => {
  const trustedPartners = [
    {
      id: 'paymongo',
      name: 'PayMongo',
      icon: <FaCreditCard className="text-2xl" />,
      purpose: 'Payment Processing',
      description: 'Securely processes your payment information and transactions.',
      location: 'Philippines / Singapore',
      certified: 'PCI DSS Level 1 Certified',
      privacyPolicy: 'https://www.paymongo.com/privacy'
    },
    {
      id: 'groq',
      name: 'Groq AI',
      icon: <FaRobot className="text-2xl" />,
      purpose: 'AI Shopping Assistant',
      description: 'Powers our intelligent product recommendations and chat support.',
      location: 'United States',
      certified: 'SOC 2 Type II Certified',
      privacyPolicy: 'https://groq.com/privacy-policy/'
    },
    {
      id: 'resend',
      name: 'Resend',
      icon: <FaEnvelope className="text-2xl" />,
      purpose: 'Email Delivery',
      description: 'Sends order confirmations, updates, and promotional emails.',
      location: 'United States (AWS)',
      certified: 'ISO 27001 Certified',
      privacyPolicy: 'https://resend.com/legal/privacy-policy'
    },
    {
      id: 'supabase',
      name: 'Supabase',
      icon: <FaDatabase className="text-2xl" />,
      purpose: 'Backend Infrastructure',
      description: 'Securely stores and manages your account and order data.',
      location: 'Singapore',
      certified: 'SOC 2 Type II & ISO 27001 Certified',
      privacyPolicy: 'https://supabase.com/privacy'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FaShieldAlt className="text-green-600" />
          Our Trusted Partners
        </h2>
        <p className="text-gray-600">
          We work with industry-leading, certified service providers to ensure your data is protected and secure.
        </p>
      </div>

      {/* Partners Grid */}
      <div className="space-y-4">
        {trustedPartners.map((partner) => (
          <div
            key={partner.id}
            className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
          >
            <div className="flex items-start gap-4">
              <div className="text-green-600 mt-1">
                {partner.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {partner.name}
                </h3>
                <p className="text-sm text-green-600 font-medium mb-2">
                  {partner.purpose}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {partner.description}
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <strong>Location:</strong> {partner.location}
                  </span>
                  <span className="flex items-center gap-1 text-green-700">
                    <strong>✓</strong> {partner.certified}
                  </span>
                </div>

                <a
                  href={partner.privacyPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline inline-flex items-center gap-1"
                >
                  View Privacy Policy <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaShieldAlt className="text-green-600 text-xl mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Your Data Security is Our Priority</h4>
            <p className="text-sm text-gray-700">
              All our partners are carefully vetted and must meet strict security and privacy standards. 
              They are contractually required to protect your data and use it only for the purposes you've consented to.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyComplianceTab;
