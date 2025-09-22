import React from "react";
import { Link } from "react-router-dom";
import { FaGamepad, FaExclamationTriangle } from "react-icons/fa";

const Notfound = () => {
  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          @keyframes slideInLeft {
            from { transform: translateX(-50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes slideInRight {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes slideInBottom {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .fade-in {
            animation: fadeIn 0.5s ease forwards;
          }

          .scale-in {
            animation: scaleIn 0.5s ease 0.2s forwards;
            opacity: 0;
          }

          .fade-in-delay {
            animation: fadeIn 0.5s ease 0.4s forwards;
            opacity: 0;
          }

          .slide-in-left {
            animation: slideInLeft 0.5s ease 0.7s forwards;
            opacity: 0;
          }

          .slide-in-right {
            animation: slideInRight 0.5s ease 0.9s forwards;
            opacity: 0;
          }

          .slide-in-bottom {
            animation: slideInBottom 0.5s ease 0.8s forwards;
            opacity: 0;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
        <div className="max-w-4xl mx-auto text-center fade-in">
          {/* Logo and 404 Text */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6 scale-in">
              <FaExclamationTriangle className="text-white text-5xl" />
            </div>

            <h1 className="text-7xl font-bold text-green-500 mb-4 fade-in-delay">
              404
            </h1>

            <h2 className="text-3xl font-semibold text-gray-800 mb-4 fade-in-delay">
              Game Over! Page Not Found
            </h2>

            <p className="text-gray-600 max-w-md mx-auto mb-8 fade-in-delay">
              The page you're looking for might have been moved or doesn't
              exist. Let's get you back in the game!
            </p>
          </div>

          {/* Game-themed decoration */}
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-2 slide-in-left">
              <FaGamepad className="text-white text-2xl" />
            </div>

            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-2 slide-in-bottom">
              <svg
                className="text-white w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM6.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.5 3c1.33 0 2.55.47 3.5 1.25V13a3.5 3.5 0 0 0-7 0v.25c.95-.78 2.17-1.25 3.5-1.25z" />
              </svg>
            </div>

            <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-2 slide-in-right">
              <FaGamepad className="text-white text-2xl" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="hover:scale-105 active:scale-95 transition-transform">
              <Link
                to="/"
                className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition-colors"
              >
                Back to Home
              </Link>
            </div>

            <div className="hover:scale-105 active:scale-95 transition-transform">
              <Link
                to="/products"
                className="inline-block bg-white text-green-500 border-2 border-green-500 px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-50 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
          {/* Brand Logo Placeholder */}
          <div className="relative top-5 mb-5 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Logo</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notfound;