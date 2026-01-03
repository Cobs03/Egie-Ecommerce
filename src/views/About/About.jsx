import React from "react";
import { useWebsiteSettings } from "../../hooks/useWebsiteSettings";

const About = () => {
  const { settings } = useWebsiteSettings();

  return (
    <div className="min-h-screen bg-[#F3F7F6] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 font-['Bruno_Ace_SC']">
            {settings?.aboutUsTitle || "About Us"}
          </h1>
          <div className="w-24 h-1 bg-[#22c55e] mx-auto"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {settings?.aboutUsContent ||
                "Welcome to our gaming store! We provide the best PC gaming hardware and accessories."}
            </p>
          </div>

          {/* Optional: Add contact info section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-['Bruno_Ace_SC']">
              Get In Touch
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {settings?.contactEmail && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-[#22c55e] hover:underline"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              {settings?.contactPhone && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="text-[#22c55e] hover:underline"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              )}
              {settings?.contactAddress && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-700">{settings.contactAddress}</p>
                </div>
              )}
              {settings?.showroomHours && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Showroom Hours
                  </h3>
                  <p className="text-gray-700">{settings.showroomHours}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
