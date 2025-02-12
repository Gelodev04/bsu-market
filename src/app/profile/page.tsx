// filepath: src/app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";
import Link from "next/link";
import { AddSvg } from "@/assets/svgs/Svg";
import EditProfileModal, { ProfileUpdateData } from "@/ui/ProfileEdit";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  createdAt: string;
}

interface UserData {
  id:number;
  username: string;
  location: string;
  followers: string;
  profile_picture: string;
}

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("Alangilan");
  const [followers, setFollowers] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<string>("/images/user.png");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [following, setFollowing] = useState<UserData[]>([]);
  const [showFollowing, setShowFollowing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchFollowing = async () => {
      const token = localStorage.getItem("token");
      if (!token){ 
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3001/api/following",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch following list");
        }

        const data = await response.json();
        setFollowing(data);
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    fetchFollowing();
  }, []);

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("location", data.location);
      if (data.imageFile) {
        formData.append("profileImage", data.imageFile);
      }

      const response = await fetch("http://localhost:3001/api/user/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setUsername(data.username);
      setLocation(data.location);

      if (updatedData.profile_picture) {
        setProfileImage(`http://localhost:3001${updatedData.profile_picture}`);
      }
      // Update profile image if your API returns the new image URL
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error appropriately
    }
  };

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
          setFollowers(data.followers);
          if (data.profile_picture) {
            setProfileImage(data.profile_picture);
          }

          const productsResponse = await fetch(
            "http://localhost:3001/api/products",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!productsResponse.ok) {
            console.warn("No products available.");
            setProducts([]); // Set empty products array instead of throwing an error
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
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen">
      <PageNavbar />
      <div className="flex  pt-10 px-3 gap-2 flex-col border-b border-gray-400 pb-5">
        <div className="] rounded-full">
          <Image
            className="w-[150px] h-[150px] rounded-full object-cover"
            src={profileImage}
            alt="profile"
            width={500}
            height={500}
          />
        </div>
        <div className="pl-2">
          <div className="-space-y-1 ">
            <p className="text-[2.5rem] font-medium capitalize ">{username}</p>
            <p className="capitalize">{location}</p>
            <p className="capitalize">
              {" "}
              {Number(followers) === 0 ? (
                <span className="font-semibold">No followers</span>
              ) : (
                <>
                  {followers} <span className="font-semibold">followers</span>
                </>
              )}
            </p>
            <p
              className="cursor-pointer"
              onClick={() => setShowFollowing(!showFollowing)}
            >
              View Following
            </p>

            {showFollowing && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">Following:</h3>
                <ul className="mt-2 space-y-2">
                  {following.length === 0 ? (
                    <p>You are not following anyone yet.</p>
                  ) : (
                    following.map((seller) => (
                      <li key={seller.id} className="flex items-center gap-2">
                        <Image
                          src={
                            seller.profile_picture
                              ? `http://localhost:3001${seller.profile_picture}`
                              : "/images/user.png"
                          }
                          alt={seller.username}
                          className="w-10 h-10 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                        <Link
                          href={`/seller/${seller.username}`}
                          className="text-bsutheme hover:underline"
                        >
                          {seller.username}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex- gap-1 pt-1">
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="w-[70%] cursor-pointer flex items-center justify-center bg-bsutheme h-[40px] rounded hover:bg-[hsl(358,84%,62%)] duration-75"
            >
              <span className="text-white font-medium ">Edit Profile</span>
            </div>

            <div className="w-[30%] cursor-pointer flex items-center justify-center bg-[#cecccc] h-[40px] rounded hover:bg-[hsl(0,2%,70%)] duration-75">
              <span onClick={handleLogout} className="text-black font-medium">
                Log out
              </span>
            </div>

            <Link
              href="/postproduct"
              className="fixed bottom-0 right-0 z-[999] m-4 cursor-pointer    "
            >
              <AddSvg />
              <div className="bg-white rounded-full w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-10 px-6">
        <h2 className="text-2xl font-semibold">
          Your Products({products.length})
        </h2>
        <div className="grid grid-cols-2 gap-2 gap-y-4 mt-4">
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((product) => {
              const imagePaths = getImagePaths(product.image);
              return (
                <div
                  key={product.id}
                  className="rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1"
                >
                  {imagePaths.length > 0 && (
                    <Link href={`/productdetail/${product.name}`}>
                      <div className="relative">
                        <Image
                          className="object-cover w-full aspect-[4/3] rounded"
                          src={`http://localhost:3001${imagePaths[0]}`}
                          alt={product.name}
                          width={500}
                          height={500}
                        />
                        {/* Thumbnail indicators if there are multiple images */}
                        {imagePaths.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                            +{imagePaths.length - 1}
                          </div>
                        )}
                      </div>
                    </Link>
                  )}

                  <h3 className="mt-3 text-lg font-medium">{product.name}</h3>
                  <p>{product.description}</p>
                  <p className="text-bsutheme font-semibold">
                    ₱
                    {Number(product.price).toLocaleString("fil-PH", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUsername={username}
        currentLocation={location}
        currentProfile={profileImage}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default ProfilePage;
