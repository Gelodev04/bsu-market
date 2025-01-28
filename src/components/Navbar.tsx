
import React from "react";
import Image from "next/image";
import { CartSvg, Menu, SearchSvg } from "@/assets/svgs/Svg";
import CustomNavbarComponent, { useNavbarScroll } from "@/ui/CustomNavbar";

export default function myNavbar() {
    
    
  

  return (
    <CustomNavbarComponent >
      
        <div className="flex gap-3 duration-200 ">
            <Image
              className="w-[50px]"
              src="/images/BatStateU-NEU-Logo-300x282.png.webp"
              alt="logo"
              width={500}
              height={500}
            />
            <h1 className="text-[1.5rem] font-semibold tracking-wider flex items-center gap-2">
              <div className="relative">
                <span className=" ">BSU</span>
                <div className="absolute bottom-[2px] -left-1 h-[3px] rounded-full bg-bsutheme w-[29px]"></div>
              </div>{" "}
              <span className="">Market</span>
            </h1>
        </div>
      

      <ul className="flex items-center gap-3">
        <li className="cursor-pointer">
          <CartSvg />
        </li>
        <li className="cursor-pointer">
          <Menu />
        </li>
      </ul>
    </CustomNavbarComponent>
  );
}
