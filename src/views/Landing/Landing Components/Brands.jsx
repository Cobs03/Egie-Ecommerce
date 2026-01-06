import React from "react";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";

const Brands = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const logoData = [
    { src: "https://i.ibb.co/mrnkfsD9/image-33.png", alt: "Roccat" },
    { src: "https://i.ibb.co/RGNMZNhn/image-33-1.png", alt: "MSI" },
    { src: "https://i.ibb.co/zHbpMkg3/image-33-2.png", alt: "Razer" },
    { src: "https://i.ibb.co/zT8q3s69/image-33-3.png", alt: "Thermaltake" },
    { src: "https://i.ibb.co/ZzJWkXrJ/image-33-4.png", alt: "ADATA" },
    { src: "https://i.ibb.co/n8D7MmK2/image-33-5.png", alt: "Hewlett Packard" },
    { src: "https://i.ibb.co/jvtXfML0/image-33-6.png", alt: "Gigabyte" },
  ];

  return (
    <div 
      ref={ref}
      className={`w-full bg-white py-8 overflow-hidden relative transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex animate-scroll">
          {/* First set of logos */}
          {logoData.map((logo, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 w-[150px] h-[40px] md:w-[200px] md:h-[50px] mx-4 md:mx-8"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
              />
            </div>
          ))}
          {/* Second set for seamless loop */}
          {logoData.map((logo, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 w-[150px] h-[40px] md:w-[200px] md:h-[50px] mx-4 md:mx-8"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
              />
            </div>
          ))}
          {/* Third set for extra smooth transition */}
          {logoData.map((logo, index) => (
            <div
              key={`third-${index}`}
              className="flex-shrink-0 w-[150px] h-[40px] md:w-[200px] md:h-[50px] mx-4 md:mx-8"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brands;
