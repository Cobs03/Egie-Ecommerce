import React from "react";
import LandingBanner from "./Landing Components/Banner";
import Feature from "./Landing Components/Feature";
import BuildLaps from "./Landing Components/BuildLaps";
import Brands from "./Landing Components/Brands";
import NewArrivals from "./Landing Components/NewArrivals";
import TopSeller from "./Landing Components/TopSeller";
import CustomerReviews from "./Landing Components/CustomerReviews";
import Faq from "./Landing Components/Faq";

const Landing = () => {
  return (
    <>
      <div className="container-responsive landing-page">
        <LandingBanner />
        <Feature />
        <BuildLaps set="one" />
        <BuildLaps set="two" />
        <Brands />
        <NewArrivals />
        <TopSeller />
        <CustomerReviews />
        <Faq />
      </div>
    </>
  );
};

export default Landing;
