import React, { useState, useRef, useEffect } from "react";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";

const Brands = () => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);
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

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      return () =>
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  return (
    <div 
      ref={ref}
      className={`w-full bg-white p-5 relative transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="cursor-pointer absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-green-500 border border-gray-700 rounded-full p-2 shadow-md hover:bg-gray-500 transition-all duration-200 hover:scale-110"
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5 text-gray-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-green-500 border border-gray-700 rounded-full p-2 shadow-md hover:bg-gray-500 transition-all duration-200 hover:scale-110"
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5 text-gray-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Container with horizontal scroll for smaller screens */}
      <div className="flex justify-center items-center">
        <div
          ref={scrollContainerRef}
          className="flex items-center md:space-x-8 overflow-x-auto scrollbar-hide max-w-full px-4"
        >
          {logoData.map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[150px] h-[40px] md:w-[200px] md:h-[50px] mx-2 md:mx-4"
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
