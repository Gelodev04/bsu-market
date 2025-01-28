"use client";
import React, { useState } from "react";
import Image from "next/image";
import { CartSvg, Menu } from "@/assets/svgs/Svg";
import CustomNavbarComponent from "@/ui/CustomNavbar";

export default function MyNavbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      
      <div
        className={`fixed z-50 top-0 right-0 h-full w-[250px] bg-gray-800 text-white transform ${
          isSidebarOpen ? "translate-x-0 " : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleSidebar}
            className="text-white text-lg font-semibold"
          >
            Close
          </button>
        </div>
        <ul className="p-4 space-y-4">
          <li>
            <a href="/" className="hover:text-gray-400">
              Home
            </a>
          </li>
          <li>
            <a href="/shop" className="hover:text-gray-400">
              Shop
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-gray-400">
              About
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-gray-400">
              Contact
            </a>
          </li>
        </ul>
      </div>

      {/* Navbar */}
      <CustomNavbarComponent>
        <div className="flex gap-3 items-center duration-200">
          <Image
            className="w-[50px]"
            src="/images/BatStateU-NEU-Logo-300x282.png.webp"
            alt="logo"
            width={50}
            height={50}
          />
          <h1 className="text-[1.5rem] font-semibold tracking-wider flex items-center gap-2">
            <div className="relative">
              <span>BSU</span>
              <div className="absolute bottom-[2px] -left-1 h-[3px] rounded-full bg-bsutheme w-[29px]"></div>
            </div>
            <span>Market</span>
          </h1>
        </div>

        <ul className="flex items-center gap-3">
          <li className="cursor-pointer">
            <CartSvg />
          </li>
          <li
            className="cursor-pointer"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu />
          </li>
        </ul>
      </CustomNavbarComponent>
    </>
  );
}
