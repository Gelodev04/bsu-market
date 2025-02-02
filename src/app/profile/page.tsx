// filepath: src/app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:3001/api/user", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUsername(data.username);
          setLocation(data.location);
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/login");
        }
      };
      fetchUserData();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="h-screen">
      <PageNavbar />
      <div className="flex  pt-10 px-10 gap-2 flex-col border-b border-gray-400 pb-5">
        <div className="] rounded-full">
          <Image
            className="w-[150px] h-[150px] rounded-full object-cover"
            src="/images/seller1.jpg"
            alt="profile"
            width={500}
            height={500}
          />
        </div>
        <div className="pl-2">
          <div className="-space-y-2 ">
            <p className="text-[2.5rem] font-medium capitalize ">{username}</p>
            <p className="capitalize">{location}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="w-[270px] flex items-center justify-center bg-bsutheme h-[40px] rounded">
              <span className="text-white font-medium">Edit Profile</span>
            </div>
            <div className="w-[100px] flex items-center justify-center bg-[#cecccc] h-[40px] rounded">
              <span onClick={handleLogout} className="text-black font-medium">
                Log out
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
