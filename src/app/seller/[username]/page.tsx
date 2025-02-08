"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";

interface SellerProfile {
  username: string;
  email: string;
  location: string;
  followers: number;
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

  const validUsername = Array.isArray(username) ? username[0] : username || "";

  const checkFollowStatus = async (validUsername: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/follow/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const { isFollowing } = await res.json();
        setIsFollowing(isFollowing);
        localStorage.setItem(
          `followStatus_${validUsername}`,
          JSON.stringify(isFollowing)
        );
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  useEffect(() => {
    if (validUsername) {
      const storedFollowStatus = localStorage.getItem(`followStatus_${validUsername}`);
      if (storedFollowStatus) {
        setIsFollowing(JSON.parse(storedFollowStatus));
      }
      checkFollowStatus(validUsername);
    }
  }, [validUsername]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const method = isFollowing ? "DELETE" : "POST";

      const res = await fetch(`http://localhost:3001/api/follow/${validUsername}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);
        localStorage.setItem(`followStatus_${validUsername}`, JSON.stringify(newFollowStatus));
        alert(newFollowStatus ? "You followed this seller!" : "Unfollowed successfully!");
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
        const res = await fetch(`http://localhost:3001/api/seller/${validUsername}`);
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
                src="/images/seller1.jpg"
                alt="profile"
                width={500}
                height={500}
              />
            </div>
            <div className="pl-2">
              <div className="-space-y-2 ">
                <p className="text-[2.5rem] font-medium capitalize ">
                  {seller.username}
                </p>
                <p className="capitalize">{seller.location}</p>
                <p className="capitalize">{seller.followers}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleFollow}
                  className={`w-[270px] flex items-center justify-center h-[40px] rounded text-white font-medium ${
                    isFollowing ? "bg-gray-500" : "bg-bsutheme"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-5">Products</h2>
          <div className="grid grid-cols-2 gap-4">
            {seller.products.map((product, index) => (
              <div key={index} className="border p-4">
                <Image
                  className="w-full h-[200px] object-cover"
                  src={`http://localhost:3001${product.image}`}
                  alt="product"
                  width={500}
                  height={500}
                />
                <h3 className="mt-2 text-lg font-medium">{product.name}</h3>

                <p>{product.description}</p>
                <p>₱{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No seller data available.</p>
      )}
    </main>
  );
}
