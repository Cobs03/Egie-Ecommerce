import { Link } from "react-router-dom";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const LandingBanner = () => {
  return (
    <div className="">
      <Swiper
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        navigation={true}
        loop={true}
        // autoplay={{
        //   delay: 2500,
        //   disableOnInteraction: false,
        // }}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="">  
            <img
              src="https://i.ibb.co/nT6ymQq/Find-the.png"
              className="w-full h-full object-cover"
              alt="Find-the"
            />
            <div className="absolute top-3/5 left-1/5 max-md:left-2/6 transform -translate-y-1/2 -translate-x-1/2 flex gap-4">
              <Link
                to="/products"
                className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 md:px-6 py-2 md:py-3 rounded-md text-sm max-md:text-xs md:text-lg transition"
              >
                SHOP NOW
              </Link>
              <button className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-md text-sm max-md:text-xs md:text-lg transition">
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
            <div className="absolute top-4/5 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
              <Link
                to="/products"
                className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 md:px-10 py-3 md:py-4 rounded-md text-lg max-md:text-sm md:text-2xl transition"
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
