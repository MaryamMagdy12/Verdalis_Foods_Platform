import React from "react";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { AboutHero } from "../components/about/AboutHero";
import { AboutIntro } from "../components/about/AboutIntro";
import { AboutValues } from "../components/about/AboutValues";
import { AboutMission } from "../components/about/AboutMission";
import "../assets/css/AboutPage.css";

export function AboutPage() {
  const reduce = useReduceMotion();

  return (
    <div className="about-page about-page--premium">
      <AboutHero reduce={reduce} />
      <AboutIntro reduce={reduce} />
      <AboutValues reduce={reduce} />
      <AboutMission reduce={reduce} />
    </div>
  );
}
