import { Link } from "react-router-dom";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const LandingBanner = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <style>
        {`
          /* Custom styles for Swiper navigation buttons */
          @media (max-width: 768px) {
            .swiper-button-prev,
            .swiper-button-next {
              width: 30px !important;
              height: 30px !important;
              background-color: rgba(0, 0, 0, 0.4);
              border-radius: 50%;
              padding: 6px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .swiper-button-prev:after,
            .swiper-button-next:after {
              font-size: 16px !important;
              color: white;
              margin: 0 !important;
            }
          }

          /* Desktop version - add padding here too */
          .swiper-button-prev,
          .swiper-button-next {
            padding: 10px !important;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
          }
          
          /* Ensure arrows are centered within the buttons */
          .swiper-button-prev:after,
          .swiper-button-next:after {
            margin: 0 !important;
          }
        `}
      </style>
      <Swiper
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        navigation={true}
        loop={true}
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="relative">  
            <img
              src="https://i.ibb.co/nT6ymQq/1.png"
              className="w-full h-full object-cover"
              alt="Find-the"
            />
            <div className="absolute top-2/3 left-1/4 transform -translate-y-1/2 -translate-x-1/2 max-md:translate-x-[-20%] flex gap-2 md:gap-4 z-10">
              <Link
                to="/products"
                className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-2 md:px-6 py-1 md:py-3 rounded text-xs md:text-lg transition active:scale-95 active:shadow-inner"
              >
                SHOP NOW
              </Link>
              <button className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 md:px-6 py-1 md:py-3 rounded text-xs md:text-lg transition active:scale-95 active:shadow-inner">
                LEARN MORE
              </button>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide className="">
          <div className="">
            <img
              src="https://i.ibb.co/99cmMKgC/2.png"
              className="w-full h-full object-cover"
              alt="2"
            />
            <div className="absolute top-3/4 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <Link
                to="/products"
                className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-3 md:px-10 py-1.5 md:py-4 rounded text-xs md:text-2xl transition active:scale-95 active:shadow-inner"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide className="">
          <div >
            <img
              src="https://i.ibb.co/pHfPqxq/3.png"
              className="w-full h-full object-cover"
              alt="3"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default LandingBanner;
