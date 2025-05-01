import React from "react";
import Banner from "./Landing Components/Banner";
import Feature from "./Landing Components/Feature";
import BuildLaps from "./Landing Components/BuildLaps";
import Brands from "./Landing Components/Brands";
import NewArrivals from "./Landing Components/NewArrivals";
import TopSeller from "./Landing Components/TopSeller";
import Faq from "./Landing Components/Faq";

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