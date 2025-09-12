import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import OtherCart from "../Cart/Cart Components/OtherCart";
import "../Checkout/Checkout Components/fireworks.scss";

const ThankYou = () => {
  useEffect(() => {
    // Make sure body overflow is restored when component unmounts
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center relative">
      {/* Top White Section with Fireworks */}
      <div className="bg-[#F3F7F6] flex flex-col items-center justify-center py-16 px-4 relative w-full text-center">
        {/* Fireworks Effect - Position it within the top section */}
        <div className="pyro absolute inset-0 overflow-hidden">
          <div className="before"></div>
          <div className="after"></div>
        </div>

        {/* Content - Make sure it's above the fireworks */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Check icon instead of cart */}
          <div className="text-green-500 mb-4">
            <img
              src="../../../../public/others/check.gif"
              alt="Success Animation"
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 font-['Bruno_Ace_SC']">
            Thank you for Shopping at Egie Online GameShop
          </h1>
          <p className="text-gray-600 text-center mb-6 max-w-lg mx-auto">
            Your order has been received and is being processed. You will
            receive a confirmation email shortly.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-lg transition-colors duration-200 font-['Bruno_Ace_SC']"
          >
            RETURN TO SHOP MORE
          </Link>
        </div>
      </div>

      {/* Products Recommendation Section */}
      <div className="flex-1 bg-gradient-to-b from-[#F3F7F6] to-white py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto text-center">
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
