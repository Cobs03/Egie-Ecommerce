import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import TopDetails from "./DetailsComponents/TopDetails";
import Description from "./DetailsComponents/Description";
import Reviews from "./DetailsComponents/Reviews";
import CompComponents from "./DetailsComponents/CompComponents";
import Warranty from "./DetailsComponents/Warranty";
import Bundles from "./DetailsComponents/Bundles";



const ProductDetails = ({ product, onClose }) => {

  return (
    <>
      <TopDetails />

      <div className="flex flex-row max-w-7xl mx-auto px-4 py-8 w-[90%] gap-10">
        {/* Details Left*/}
        <div className="flex flex-col mb-4 bg-white p-4 rounded-lg shadow-md pl-7 flex-3/4 w-[95%] h-auto">
          <Description />

          <Reviews />

          <CompComponents />

        </div>

        {/* Details Right */}
        <div className=" flex-1/4 ">
        <Warranty />

        <Bundles />
          
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
