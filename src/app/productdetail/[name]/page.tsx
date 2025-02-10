"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import PageNavbar from "@/components/PageNavbar";
import { SaveSvg } from "@/assets/svgs/Svg";
import Link from "next/link";
import Carousel from "@/ui/Carousel";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "@/styles/pagination.css";

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description?: string;
  // user fields
  username: string;
  email: string;
  image: string;
  location: string;
  condition: string;
}

export default function ProductDetailPage() {
  const { name } = useParams() as { name: string };
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

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

  const checkFollowStatus = async (username: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) return;

      const res = await fetch(`http://localhost:3001/api/follow/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const { isFollowing } = await res.json();
        setIsFollowing(isFollowing);
        // Store follow status with both the current user ID and the followed username
        localStorage.setItem(
          `followStatus_${currentUserId}_${username}`,
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
    if (data?.username && currentUserId) {
      // Get follow status using both current user ID and followed username
      const storedFollowStatus = localStorage.getItem(
        `followStatus_${currentUserId}_${data.username}`
      );
      if (storedFollowStatus) {
        setIsFollowing(JSON.parse(storedFollowStatus));
      }
      checkFollowStatus(data.username);
    }
  }, [data?.username, currentUserId]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) {
        alert("Please log in first");
        return;
      }

      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(
        `http://localhost:3001/api/follow/${data?.username}`,
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
          `followStatus_${currentUserId}_${data?.username}`,
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
    if (!name) {
      setError("Product name is missing in the URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Retrieve the JWT token from localStorage (or another storage mechanism)

        const res = await fetch(
          `http://localhost:3001/api/productdetail/${encodeURIComponent(name)}`
        );

        if (!res.ok) {
          const errMessage = await res.text();
          setError(errMessage || "Failed to fetch product details");
          setLoading(false);
          return;
        }

        const result = await res.json();
        setData(result);

        if (result.username && currentUserId) {
          await checkFollowStatus(result.username);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, currentUserId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="h-screen">
      <PageNavbar />

      {data ? (
        <div>
          <Swiper
            spaceBetween={1}
            slidesPerView={1}
            pagination={true}
            modules={[Pagination]}
          >
            {getImagePaths(data.image).map((imagePath, index) => (
              <SwiperSlide key={index}>
                <Image
                  className="w-full h-[400px] object-cover"
                  src={`http://localhost:3001${imagePath}`}
                  alt={`${data.name} - Image ${activeImageIndex + 1}`}
                  width={500}
                  height={500}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* NAME SECTION */}

          <div className="flex items-center justify-between px-3  pt-7">
            <div className="-space-y-2">
              <p>
                <span className="text-bsutheme font-medium">₱</span>
                <span className="text-[1.7rem] font-semibold text-bsutheme">
                  {data.price}
                </span>
              </p>
              <h2 className="text-[1.4rem] font-medium">{data.name}</h2>
              {data.description && <p className="">{data.description}</p>}
            </div>
            <div>
              <SaveSvg />
            </div>
          </div>

          {/* SELLER SECTION */}

          <div className="border-b border-t border-gray-300  mt-5 px-5 py-2">
            <div className="flex items-center  justify-between">
              <Link
                href={`/seller/${data.username}`}
                className="flex items-center gap-2"
              >
                <img
                  className="w-[60px] rounded-full"
                  src="/images/seller1.jpg"
                  alt=""
                />
                <h1 className="capitalize text-lg">{data.username}</h1>
              </Link>
              <button
                onClick={handleFollow}
                className={`rounded-full hover:bg-[hsl(358,84%,62%)] px-3 text-sm py-[1px] text-white ${
                  isFollowing ? "bg-gray-500" : "bg-bsutheme"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          </div>

          {/* DETAILS SECTION */}

          <div className="px-3 pt-5">
            <h1 className="font-semibold text-[1.5rem]">Details</h1>
            <p>
              <span className="font-medium">Location: </span>
              {data.location}
            </p>
            <p>
              <span className="font-medium">Condition: </span>
              {data.condition}
            </p>
          </div>
        </div>
      ) : (
        <p>No product details available.</p>
      )}
    </main>
  );
}
