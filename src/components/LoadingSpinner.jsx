import { useState, useEffect } from "react";

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time or wait for actual resources to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loader for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-[#0F0F0F] z-50 flex items-center justify-center">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingSpinner;
