import Image from "next/image";
import { CartSvg, Menu, ProfileSvg, SearchSvg } from "@/assets/svgs/Svg";
import CustomNavbarComponent from "@/ui/CustomNavbar";
import Link from "next/link";


export default function MyNavbar() {

  
  return (
    <>
      <CustomNavbarComponent>
        <div className="flex gap-3 items-center duration-200">
          <Image
            className="w-[50px] h-[50px] object-cover"
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
            <SearchSvg/>
          </li>
          <li className="cursor-pointer">
            <ProfileSvg/>
          </li>
        </ul>
      </CustomNavbarComponent>
    </>
  );
}
