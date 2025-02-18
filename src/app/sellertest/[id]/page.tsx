"use client";
import PageNavbar from "@/components/PageNavbar";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ProductDetail } from "@/types/product.d";
import { Spinner } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import SellerDetails from "@/components/SellerDetails";


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUserId } = useAuth();
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

  const checkFollowStatus = async (userId: number) => {
    console.log("Checking follow status for userId:", userId); // Add this line
        console.log("Current user ID:", currentUserId); // Add this line


        if (!currentUserId) {
            console.error("currentUserId is undefined");
            return;
          }

    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const { isFollowing } = await res.json();
        setIsFollowing(isFollowing);
        localStorage.setItem(
          `followStatus_${currentUserId}_${userId}`,
          JSON.stringify(isFollowing)
        );
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) {
        router.push("/login");
        return;
      }

      if (!data?.id) {
        alert("User information not available");
        return;
      }

      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${data?.id}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);
        // Store follow status with both the current user ID and the followed username
        localStorage.setItem(
          `followStatus_${currentUserId}_${data?.id}`,
          JSON.stringify(newFollowStatus)
        );
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
    // Restore follow and save status from localStorage when the component mounts
    if (currentUserId) {
      if (data?.id) {
        const storedFollowStatus = localStorage.getItem(
          `followStatus_${currentUserId}_${data.id}`
        );
        if (storedFollowStatus) {
          setIsFollowing(JSON.parse(storedFollowStatus));
        }
        checkFollowStatus(data.id); // Re-check follow status from the server
      }
    }
  }, [data?.id,  currentUserId]);

  useEffect(() => {
    if (!params.id) {
      setError("Product ID is missing in the URL");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/seller/${params.id}`
        );

        if (!res.ok) {
          const errMessage = await res.text();
          setError(errMessage || "Failed to fetch product details");
          return;
        }

        const result = await res.json();
        console.log(result);
        setData(result);
        
        if (result.id && currentUserId) {
          await Promise.all([checkFollowStatus(result.id)]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, currentUserId]);

  if (loading)
    return (
      <Spinner
        color="danger"
        className="h-screen flex justify-center items-center"
      />
    );
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No product details available.</p>;

  return (
    <main>
      <PageNavbar />
      {data ? (
        <div className="px-3">
          <div className="flex  pt-10  gap-2 flex-col border-b border-gray-400 pb-5">
            <div className=" rounded-full">
              <Image
                className="w-[150px] h-[150px] rounded-full object-cover"
                src={
                  `${process.env.NEXT_PUBLIC_API_URL}${data?.profile_picture}` ||
                  "/images/user.png"
                }
                alt="profile"
                width={500}
                height={500}
              />
            </div>
            <div className="pl-2">
              <div className="-space-y-1 ">
                <p className="text-[2.5rem] font-medium capitalize ">
                  {data.username}
                </p>
                <p className="capitalize">{data.location}</p>
                <p className="capitalize font-semibold">
                  {Number(data.followers) === 0 ? (
                    <span className="font-semibold">No followers</span>
                  ) : (
                    <>
                      {data.followers}{" "}
                      <span className="font-semibold">followers</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleFollow}
                  className={`w-[270px] flex items-center justify-center h-[40px] rounded text-white font-medium ${
                    isFollowing
                      ? "bg-gray-500 hover:bg-[hsl(220,9%,50%)]"
                      : "bg-bsutheme hover:bg-[hsl(358,84%,62%)] active:bg-[hsl(358,84%, 70%)]"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          </div>
            
          <SellerDetails sellerId={data.id} />
          {/* <h2 className="text-xl font-semibold mt-5 px-3">
          Products({data.products.length})
        </h2>

         <div className="grid grid-cols-2 gap-2 gap-y-4 mt-4 px-3">
          {data.products.map((product, index) => {
            const imagePaths = getImagePaths(product.image);
            return (
              <div
                key={index}
                className="rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1"
              >
                {imagePaths.length > 0 && (
                  <Link href={`/productdetail/${product.id}`}>
                    <div className="relative">
                      <Image
                        className="object-cover w-full aspect-[4/3] rounded"
                        src={`${process.env.NEXT_PUBLIC_API_URL}${imagePaths[0]}`}
                        alt={product.name}
                        width={500}
                        height={500}
                      />
                    
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
        </div> */}
        </div>
      ) : (
        <p>No seller data available.</p>
      )}
    </main>
  );
}
