import React from "react";
import ShopSection from "@/components/ShopSection";
import Navbar from "@/components/Navbar";
import HomeSection from "@/components/HomeSection";
import fs from "fs";
import path from "path";
import Carousel from "@/ui/Carousel";


export default async function Home() {
  return (
    <>
      <Navbar/>
      <HomeSection />

      <ShopSection />
    </>
  );
}
