
import { Link } from "react-router-dom";
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";



// import required modules
import { Navigation, Pagination, Autoplay } from "swiper/modules";



const LandingBanner = () => {
  return (
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
      spaceBetween={50}
      slidesPerView={1}
      onSlideChange={() => console.log("slide change")}
      onSwiper={(swiper) => console.log(swiper)}
      className="mt-4"
    >
      <SwiperSlide className="bg-red-400 h-[90%]">
        <div className="flex gap-4">
          <img
            src="https://i.ibb.co/nT6ymQq/Find-the.png"
            className="w-full h-full object-cover"
            alt="Find-the"
            border="0"
          />
          <div className="buttons absolute mt-70 ml-20">
            <Link
              to="/products"
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-md transition mr-4"
            >
              SHOP NOW
            </Link>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md transition">
              LEARN MORE
            </button>
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide className="bg-red-400">
        <div className="flex gap-4">
          <img
            src="https://i.ibb.co/99cmMKgC/2.png"
            className="w-full h-full object-cover"
            alt="2"
            border="0"
          />
          <div className="buttons absolute mt-90 ml-[50%] -translate-x-1/2">
            <Link
              to="/products"
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-10 py-3 rounded-md transition text-3xl"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide className="bg-red-400">
        <div className="flex gap-4">
          <img
            src="https://i.ibb.co/pHfPqxq/3.png"
            className="w-full h-full object-cover"
            alt="3"
            border="0"
          />
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default LandingBanner;
