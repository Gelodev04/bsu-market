"use client";
import Image from "next/image";
import CustomNavbarComponent from "@/ui/CustomNavbar";
import Link from "next/link";
import { Skeleton } from "@heroui/react";
import { useAuth } from "@/context/auth-context";

export default function MyNavbar() {
  const { isLoggedIn, userProfile, loading, getProfileImage } = useAuth();

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
              ) : (
                <li>
                  <Link href="/profile">
                    <div className="overflow-hidden rounded-full aspect-square w-[40px] lg:w-[50px]">
                      {loading ? (
                        <Skeleton className="rounded-full w-full h-full">
                          <div />
                        </Skeleton>
                      ) : (
                        <Image
                          className="object-cover w-full h-full rounded-full "
                          src={getProfileImage()}
                          alt="profile"
                          width={50}
                          height={50}
                        />
                      )}
                    </div>
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
