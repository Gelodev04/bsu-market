import React from "react";
import ShopSection from "@/components/ShopSection";
import Navbar from "@/components/Navbar";
import HomeSection from "@/components/HomeSection";
import { AddSvg } from "@/assets/svgs/Svg";
import Link from "next/link";







export default async function Home() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
  
  const products = await data.json()
console.log(products);
 
  return (
    <>
      <Link href="/postproduct" className="fixed bottom-0 right-0 z-[999] m-4 cursor-pointer hover:outline hover:outline-2 hover:outline-white  rounded-full">
        <AddSvg />

        <div className="bg-white rounded-full w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      </Link>
      <Navbar />
      <HomeSection />
  
      <ShopSection products={products}/>
    </>
  );
}

