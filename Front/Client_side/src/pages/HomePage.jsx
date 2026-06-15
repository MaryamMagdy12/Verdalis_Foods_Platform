import React from "react";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { HomeHero } from "../components/home/HomeHero";
import { HomeAboutPrime } from "../components/home/HomeAboutPrime";
import { HomeFeaturedCategories } from "../components/home/HomeFeaturedCategories";
import { HomePopularProducts } from "../components/home/HomePopularProducts";
import { HomeWholesaleDeals } from "../components/home/HomeWholesaleDeals";
import { HomeLogistics } from "../components/home/HomeLogistics";
import { HomeRetailerBenefits } from "../components/home/HomeRetailerBenefits";
import { HomeWhyChooseUs } from "../components/home/HomeWhyChooseUs";
import { HomeContact } from "../components/home/HomeContact";
import { HomeTrustFeatureStrip } from "../components/home/HomeOrganicTransitions";
import "../assets/css/home-premium.css";
import "../assets/css/home-shop-mockup.css";
import "../assets/css/platform-design.css";

export function HomePage() {
  const reduce = useReduceMotion();

  return (
    <div className="home-page">
      <HomeHero reduce={reduce} />
      <div className="hp-shop-mockup">
        <i className="fa-solid fa-leaf hp-shop-mockup__leaf hp-shop-mockup__leaf--tl" aria-hidden="true" />
        <i className="fa-solid fa-leaf hp-shop-mockup__leaf hp-shop-mockup__leaf--tr" aria-hidden="true" />
        <i className="fa-solid fa-leaf hp-shop-mockup__leaf hp-shop-mockup__leaf--bl" aria-hidden="true" />
        <HomeFeaturedCategories reduce={reduce} />
        <HomePopularProducts reduce={reduce} />
      </div>
      <HomeWholesaleDeals />
      <HomeLogistics reduce={reduce} />
      <HomeRetailerBenefits />
      <HomeAboutPrime reduce={reduce} />
      <HomeWhyChooseUs reduce={reduce} />
      <HomeTrustFeatureStrip />
      <HomeContact reduce={reduce} />
    </div>
  );
}
