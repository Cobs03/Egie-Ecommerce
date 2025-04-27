import React from "react";
import { Link } from "react-router-dom";

const LandingBanner = () => {
  return (
    <div
      className="relative flex items-center rounded-lg overflow-hidden h-[90vh] w-[95%] mx-auto mt-8"
      style={{
        backgroundImage: "url('https://i.ibb.co/9H5Bx4WK/image.png')",
        backgroundSize: "cover",
        backgroundPosition: "rightr",
      }}
    >
      {/* Black Gradient Overlay on Left Side */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-8">
        <h1 className="text-3xl md:text-6xl text-white mb-6">
          FIND THE <span className="text-lime-500 ">BEST PC PARTS</span>  FOR YOU
        </h1>
        <div className="flex gap-4">
          <Link
            to="/products"
            className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-md transition"
          >
            SHOP NOW
          </Link>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md transition">
            LEARN MORE
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingBanner;
