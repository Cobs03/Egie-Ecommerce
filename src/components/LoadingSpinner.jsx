import { useState, useEffect } from "react";
import { useWebsiteSettings } from "../hooks/useWebsiteSettings";

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useWebsiteSettings();

  useEffect(() => {
    // Simulate loading time or wait for actual resources to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loader for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={settings?.aiLogoUrl || "/Logo/Ai.png"} 
              alt="Loading" 
              className="w-10 h-10 object-contain animate-pulse"
            />
          </div>
        </div>
        <p className="text-gray-700 font-semibold text-lg animate-pulse">
          Loading {settings?.storeName || "EGIE E-Commerce"}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
