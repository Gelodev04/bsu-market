import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import Image from "next/image";
import Link from "next/link";

export const CartSvg = () => {
  return (
    <svg
      width={23}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
          stroke="#eb1c24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  );
};

export const Menu = () => {
  return (
    <svg
      width={40}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g id="Menu / Menu_Alt_01">
          {" "}
          <path
            id="Vector"
            d="M12 17H19M5 12H19M5 7H19"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>{" "}
        </g>{" "}
      </g>
    </svg>
  );
};

export default function PageNavbar() {
  return (
    <Navbar
      className="fixed bg-opacity-[0.9] transition-all duration-200
            bg-white text-black py-3 
        "
      shouldHideOnScroll
      isBlurred={false}
    >
      <Link href="/#shop">
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
      </Link>

      <ul className="flex items-center gap-3">
        <li className="cursor-pointer">
          <CartSvg />
        </li>
      </ul>
    </Navbar>
  );
}
