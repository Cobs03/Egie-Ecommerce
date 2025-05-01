import React from "react";
import { Link } from "react-router-dom";
import { BsFillCartCheckFill } from "react-icons/bs";

const ThankYou = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Top White Section */}

      <div className="flex-1 bg-[#F3F7F6] flex flex-col items-center justify-center relative z-10 top-[20]">
        <div className="text-5xl text-green-500 mb-4 relative ">
          <BsFillCartCheckFill />
        </div>
        <h1 className="text-2xl font-semibold text-center mb-6">
          Thank you for Shopping at Egie Online GameShop
        </h1>
        <Link
          to="/"
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-lg"
        >
          RETURN TO SHOP MORE
        </Link>
      </div>

      {/* Bottom Image with Gradient Overlay */}
      <div className="relative h-2/4 mb-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F7F6] to-transparent z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('https://i.ibb.co/Rky5TgCw/Frame-453.png')",
          }}
        ></div>
      </div>
    </div>
  );
};

export default ThankYou;
