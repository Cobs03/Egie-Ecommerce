import React from 'react';

/**
 * Unified Loading Indicator Component
 * Provides consistent loading animations across the entire application
 */

// Full Page Loader
export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        {message && (
          <p className="text-gray-600 font-medium text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Inline Spinner (for buttons, small areas)
export const Spinner = ({ size = 'md', color = 'green' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    green: 'border-green-500',
    white: 'border-white',
    gray: 'border-gray-400',
    blue: 'border-blue-500',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} border-b-2 rounded-full animate-spin`}></div>
  );
};

// Dots Loader (for typing/chat indicators)
export const DotsLoader = ({ color = 'gray' }) => {
  const colorClasses = {
    gray: 'bg-gray-400',
    green: 'bg-green-500',
    white: 'bg-white',
  };

  return (
    <div className="flex space-x-1">
      <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}></div>
      <div 
        className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div 
        className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
  );
};

// Section Loader (for content areas)
export const SectionLoader = ({ message = "Loading content..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
};

// Card Skeleton Loader (for product cards, etc.)
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </>
  );
};

// Button Loader (replaces button content while loading)
export const ButtonLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Spinner size="sm" color="white" />
      <span>{text}</span>
    </div>
  );
};

// Pulsing Logo Loader
export const LogoLoader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
    </div>
  );
};

export default {
  PageLoader,
  Spinner,
  DotsLoader,
  SectionLoader,
  CardSkeleton,
  ButtonLoader,
  LogoLoader,
};
