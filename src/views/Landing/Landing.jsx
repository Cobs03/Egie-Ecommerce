import React from "react";
import Banner from "./Banner/Banner";
import Feature from "./FeaturedProd/Feature";
import BuildLaps from "./BuildLaps/BuildLaps";
import Brands from "./Brands/Brands";
import NewArrivals from "./NewArrivals/NewArrivals";
import TopSeller from "./TopSellers/TopSeller";
import Faq from "./Faq/Faq";

const Landing = () => {

    return (
        <>
            <Banner />
            <Feature />
            <BuildLaps set="one"/>
            <BuildLaps set="two" />
            <Brands />
            <NewArrivals />
            <TopSeller />
            <Faq />
        </>
    )
}

export default Landing;