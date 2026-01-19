import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import OtherCart from "../Cart/Cart Components/OtherCart";
import "../Checkout/Checkout Components/Fireworks.scss";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ThankYou = () => {
  // Scroll animations
  const contentAnim = useScrollAnimation({ threshold: 0.1 });
  const productsAnim = useScrollAnimation({ threshold: 0.1 });
  
  useEffect(() => {
    // Allow body to scroll on this page
    document.body.style.overflow = "auto";

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center relative bg-white">
      {/* Combined Section with Fireworks */}
      <div className="bg-[#F3F7F6] flex flex-col items-center justify-center py-16 px-4 relative w-full">
        {/* Fireworks Effect - Position it within the section */}
        <div className="pyro absolute inset-0 overflow-hidden">
          <div className="before"></div>
          <div className="after"></div>
        </div>

        {/* Content - Make sure it's above the fireworks */}
        <div
          ref={contentAnim.ref}
          className={`relative z-20 flex flex-col items-center text-center transition-all duration-700 ${
            contentAnim.isVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        >
          {/* Check icon instead of cart */}
          <div className="text-green-500 mb-4">
            <img
              src="/Logo/check (1).gif"
              alt="Success Animation"
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 font-['Bruno_Ace_SC']">
            Thank you for Shopping at NovaTech
          </h1>
          <p className="text-gray-600 text-center mb-6 max-w-lg mx-auto">
            Your order is being processed. You will receive a confirmation email
            shortly.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-lg transition-all duration-200 font-['Bruno_Ace_SC'] active:scale-95"
          >
            RETURN TO SHOP MORE
          </Link>
        </div>

        {/* Products Recommendation Section */}
        <div
          ref={productsAnim.ref}
          className={`relative z-30 w-full max-w-7xl mx-auto px-4 mt-12 transition-all duration-700 ${
            productsAnim.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <OtherCart />
        </div>
      </div>

      {/* Override the body background color from the fireworks.scss */}
      <style jsx="true">{`
        body {
          background: transparent;
          overflow: auto;
        }

        /* Adjust fireworks to fit within the top section */
        .pyro {
          pointer-events: none;
        }

        /* Ensure content remains interactive */
        .pyro > .before,
        .pyro > .after {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ThankYou;
