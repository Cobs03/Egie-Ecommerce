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
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="text-gray-700 font-semibold text-lg">
          Loading {settings?.storeName || settings?.brandName || "NovaTech"}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
