import { useState, useEffect } from "react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { settings, loading: settingsLoading } = useWebsiteSettings();

  useEffect(() => {
    // Wait for both the timer and settings to load
    const timer = setTimeout(() => {
      if (!settingsLoading) {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [settingsLoading]);

  // Don't show loader once settings are loaded and timer expired
  useEffect(() => {
    if (!settingsLoading && !isLoading) {
      setIsLoading(false);
    }
  }, [settingsLoading, isLoading]);

  if (!isLoading && !settingsLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Enhanced loader with pulsing logo */}
        <div className="relative w-32 h-32">
          {/* Outer glow ring */}
          <div className="absolute inset-0 border-4 border-green-100 rounded-full animate-pulse"></div>
          
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 border-r-green-400 rounded-full animate-spin"></div>
          
          {/* Inner spinning ring */}
          <div className="absolute inset-2 border-4 border-transparent border-b-green-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Logo in center with white background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <img 
                src={settings?.logoUrl || "https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"} 
                alt="Logo" 
                className="w-14 h-14 object-contain animate-pulse"
                onError={(e) => {
                  e.target.src = "https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png";
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading text with dots animation */}
        <div className="flex items-center gap-2">
          <p className="text-gray-700 font-semibold text-xl">
            {settingsLoading ? "Loading" : `Loading ${settings?.storeName || settings?.brandName || "NovaTech"}`}
          </p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>

        {/* Subtle tagline */}
        <p className="text-gray-500 text-sm animate-pulse">Please wait...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
