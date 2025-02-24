"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";
import Link from "next/link";
import { AddSvg } from "@/assets/svgs/Svg";
import EditProfileModal, { ProfileUpdateData } from "@/ui/ProfileEdit";
import Checkbox from "@/ui/Checkbox";
import { Product, UserData } from "@/types/profile";
import StatsSection from "@/components/Profile/StatsSection";
import { ProductsSection } from "@/components/Profile/ProductsSection";
import { getUserFollowing } from "@/services/api";
import { useAuth } from "@/context/auth-context";


const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("Alangilan");
  const [followers, setFollowers] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<string>("/images/user.png");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const { handleLogout, userProfile, getProfileImage } = useAuth();
  const router = useRouter();

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("location", data.location);
      if (data.imageFile) {
        formData.append("profileImage", data.imageFile);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setUsername(data.username);
      setLocation(data.location);

      if (updatedData.profile_picture) {
        setProfileImage(`${updatedData.profile_picture}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.status === 401 || response.status === 403) {
          console.warn(
            "No authentication cookie found. Redirecting to login..."
          );
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUsername(data.username);
        setLocation(data.location);
        setFollowers(data.followers);
        if (data.profile_picture) {
          setProfileImage(
            `${process.env.NEXT_PUBLIC_API_URL}${data.profile_picture}`
          );
        }

        const productsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!productsResponse.ok) {
          console.warn("No products available.");
          setProducts([]);
          return;
        }

        let productsData = await productsResponse.json();

        productsData = productsData.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [router]);

  return (
    <div className="min-h-screen">
      <PageNavbar />
      <div className=" max-w-[900px] mx-auto">
        <div className="flex   pt-10  gap-2 flex-col pb-5">
          <div className="border-b border-gray-400 flex flex-col items-center pb-7 px-6">
            <div className=" rounded-full">
              <Image
                className="w-[150px] h-[150px] rounded-full object-cover"
                src={getProfileImage()}
                alt="profile"
                width={500}
                height={500}
                priority
              />
            </div>
            <div className=" w-full text-center">
              <div className="-space-y-1 ">
                <p className="text-[2.5rem] font-medium  ">@{username}</p>
                <p className="capitalize font-medium text-gray-800">
                  {location}
                </p>
                {/* FOLLOWING */}
                <StatsSection followers={followers} />

                <div className="flex flex- gap-1 pt-1">
                  <div
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-[70%] cursor-pointer flex items-center justify-center bg-bsutheme h-[40px] rounded lg:hover:bg-[hsl(358,84%,62%)] active:bg-[hsl(358,84%,62%)] duration-75"
                  >
                    <span className="text-white font-medium ">
                      Edit Profile
                    </span>
                  </div>
                  <div
                    onClick={handleLogout}
                    className="w-[30%] cursor-pointer flex items-center justify-center bg-[#cecccc] h-[40px] rounded hover:bg-[hsl(0,2%,70%)] duration-75"
                  >
                    <span className="text-black font-medium">Log out</span>
                  </div>
                  <Link
                    href="/postproduct"
                    className="fixed bottom-0 right-0 z-[99] m-4 cursor-pointer    "
                  >
                    <AddSvg />
                    <div className="bg-white rounded-full w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* PRODUCTS SECTION */}
          <ProductsSection products={products} />

          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            currentUsername={username}
            currentLocation={location}
            currentProfile={profileImage}
            onSave={handleProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
