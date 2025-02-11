"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface SellerProfile {
  id: number;
  username: string;
  email: string;
  location: string;
  followers: number;
  profile_picture: string;
  products: Array<{
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
  }>;
}

export default function SellerProfilePage() {
  const { username } = useParams(); // Retrieve the username from the URL query
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const router = useRouter();

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

  const validUsername = Array.isArray(username) ? username[0] : username || "";

  const getCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUserId(userData.id.toString());
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const checkFollowStatus = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) return;

      const res = await fetch(`http://localhost:3001/api/follow/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const { isFollowing } = await res.json();
        setIsFollowing(isFollowing);
        // Store follow status with both the current user ID and the followed username
        localStorage.setItem(
          `followStatus_${currentUserId}_${userId}`,
          JSON.stringify(isFollowing)
        );
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (seller?.id && currentUserId) {
      // Get follow status using both current user ID and followed username
      const storedFollowStatus = localStorage.getItem(
        `followStatus_${currentUserId}_${seller.id}`
      );
      if (storedFollowStatus) {
        setIsFollowing(JSON.parse(storedFollowStatus));
      }
      checkFollowStatus(seller.id);
    }
  }, [seller?.id, currentUserId]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) {
       router.push("/login")
        return;
      }

      if (!seller?.id) {
        alert("Seller information not available");
        return;
      }

      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`http://localhost:3001/api/follow/${seller.id}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);
        // Store follow status with both the current user ID and the followed username
        localStorage.setItem(
          `followStatus_${currentUserId}_${seller.id}`,
          JSON.stringify(newFollowStatus)
        );

        // alert(newFollowStatus ? "You followed this seller!" : "Unfollowed successfully!");
      } else {
        const errMessage = await res.text();
        alert(`Error: ${errMessage}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    if (!validUsername) return;

    const fetchSellerData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/seller/${validUsername}`
        );
        if (!res.ok) {
          setError("Failed to fetch seller profile.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setSeller(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [validUsername]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <PageNavbar />
      {seller ? (
        <div className="px-3">
          <div className="flex  pt-10  gap-2 flex-col border-b border-gray-400 pb-5">
            <div className="] rounded-full">
              <Image
                className="w-[150px] h-[150px] rounded-full object-cover"
                src={seller?.profile_picture || "/images/user.png"}
                alt="profile"
                width={500}
                height={500}
              />
            </div>
            <div className="pl-2">
              <div className="-space-y-1 ">
                <p className="text-[2.5rem] font-medium capitalize ">
                  {seller.username}
                </p>
                <p className="capitalize">{seller.location}</p>
                <p className="capitalize font-semibold">
                  {Number(seller.followers) === 0 ? (
                    <span className="font-semibold">No followers</span>
                  ) : (
                    <>
                      {seller.followers}{" "}
                      <span className="font-semibold">followers</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleFollow}
                  className={`w-[270px] flex items-center justify-center h-[40px] rounded text-white font-medium ${
                    isFollowing ? "bg-gray-500 hover:bg-[hsl(220,9%,50%)]" : "bg-bsutheme hover:bg-[hsl(358,84%,62%)] active:bg-[hsl(358,84%, 70%)]"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-5 px-3">
            Products({seller.products.length})
          </h2>

          <div className="grid grid-cols-2 gap-2 gap-y-4 mt-4 px-3">
            {seller.products.map((product, index) => {
              const imagePaths = getImagePaths(product.image);
              return (
                <div
                  key={index}
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
                  <h3 className="mt-2 text-lg font-medium">{product.name}</h3>

                  <p>{product.description}</p>
                  <p>
                    ₱
                    {Number(product.price).toLocaleString("fil-PH", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p>No seller data available.</p>
      )}
    </main>
  );
}
