"use client";
import Image from "next/image";
import { CartSvg, Menu, ProfileSvg, SearchSvg } from "@/assets/svgs/Svg";
import CustomNavbarComponent from "@/ui/CustomNavbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function MyNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    profile_picture?: string;
    role?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetchUserProfile(token);
    }
  }, []);
  
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUserProfile(userData);

      if(userData.role ==- "admin"){
        router.push("/admin-dashboard");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  return (
    <>
      <CustomNavbarComponent>
        <div className="flex gap-2 items-center duration-200">
          <Image
            className="w-[40px] h-[40px] object-cover lg:w-[55px] lg:h-[55px]"
            src="/images/BatStateU-NEU-Logo-300x282.png.webp"
            alt="logo"
            width={50}
            height={50}
          />
          <h1 className="text-[1.3rem]  font-semibold tracking-wider flex items-center gap-2">
            <div className="relative">
              <span>BSU</span>
              <div className="absolute bottom-[2px] -left-1 h-[3px] rounded-full bg-bsutheme w-[29px]"></div>
            </div>
            <span>Market</span>
          </h1>
        </div>

        <ul className="flex items-center gap-3 duration-200 ">
        

          {isLoggedIn ? (
            <>
            {userProfile?.role === "admin" ? (
                <li>
                  <Link href="/admin-dashboard">
                    <p className="text-red-500">Admin Dashboard</p>
                  </Link>
                </li>
              ): (
              <li>
                <Link href="/profile">
                <Image
                    className="rounded-full w-[40px] lg:w-[50px] "
                    src={userProfile?.profile_picture
                      ? `${process.env.NEXT_PUBLIC_API_URL}${userProfile.profile_picture}`
                      : "/images/user.png"
                  }
                    alt="profile"
                    width={50}
                    height={50}
                    />
                </Link>
              </li>
              )}
            </>
          ) : (
            <>
              <li>
                <Link href="/login">
                  <p className="">Login</p>
                </Link>
              </li>
              <li>
                <Link href="/signup">
                  <p className="">Sign Up</p>
                </Link>
              </li>
            </>
          )}
        </ul>
      </CustomNavbarComponent>
    </>
  );
}
