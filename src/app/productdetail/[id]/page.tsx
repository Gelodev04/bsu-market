"use client";
import PageNavbar from "@/components/PageNavbar";
import { ProductImages } from "@/components/ProductDetail/ProductImages";
import { ProductInfo } from "@/components/ProductDetail/ProductInfo";
import { SellerInfo } from "@/components/ProductDetail/SellerInfo";
import ChatBox from "@/components/ProductDetail/ChatBox";
import { ProductDetails } from "@/components/ProductDetail/ProductDetails";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ProductDetail } from "@/types/product.d";
import { Spinner } from "@heroui/react";
import { getProducts } from "@/services/api";


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUserId } = useAuth();
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

  const checkFollowStatus = async (userId: number) => {
    try {
      if (!currentUserId) {
        setIsFollowing(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow/status/${userId}`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const { isFollowing } = await res.json();
        setIsFollowing(isFollowing);
        // Store with user-specific key
        localStorage.setItem(
          `followStatus_${currentUserId}_${userId}`,
          JSON.stringify(isFollowing)
        );
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
      setIsFollowing(false);
    }
  };

  const checkSaveStatus = async (productId: number) => {
    try {
      if (!currentUserId) {
        setIsSaved(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/save/status/${productId}`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const { isSaved } = await res.json();
        setIsSaved(isSaved);
        // Store with user-specific key
        localStorage.setItem(
          `saveStatus_${currentUserId}_${productId}`,
          JSON.stringify(isSaved)
        );
      }
    } catch (error) {
      console.error("Error checking save status:", error);
      setIsSaved(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!currentUserId) {
        router.push("/login");
        return;
      }

      if (!data?.id) {
        alert("Product information not available");
        return;
      }

      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/save/${data?.id}`,
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved);
        localStorage.setItem(
          `saveStatus_${currentUserId}_${data.id}`,
          JSON.stringify(newIsSaved)
        );
      } else {
        const errMessage = await res.text();
        alert(`Error: ${errMessage}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  const handleFollow = async () => {
    try {
      if (!currentUserId) {
        router.push("/login");
        return;
      }

      if (!data?.user_id) {
        alert("User information not available");
        return;
      }

      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${data?.user_id}`,
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        localStorage.setItem(
          `followStatus_${currentUserId}_${data.user_id}`,
          JSON.stringify(newIsFollowing)
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

  // Reset states when user changes
  useEffect(() => {
    setIsFollowing(false);
    setIsSaved(false);

    if (data?.id && data?.user_id) {
      // Check status only if we have both currentUserId and required IDs
      if (currentUserId) {
        checkSaveStatus(data.id);
        checkFollowStatus(data.user_id);
      }
    }
  }, [currentUserId, data?.id, data?.user_id]);

  // Initial data fetch
  useEffect(() => {
    if (!params.id) {
      setError("Product ID is missing in the URL");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/productdetail/${params.id}`
        );

        if (!res.ok) {
          const errMessage = await res.text();
          setError(errMessage || "Failed to fetch product details");

          return;
        }

        const result = await res.json();
        setData(result);

        // Only check statuses if user is logged in
        if (currentUserId) {
          // Get stored states with user-specific keys
          const savedStatus = localStorage.getItem(
            `saveStatus_${currentUserId}_${result.id}`
          );
          const followStatus = localStorage.getItem(
            `followStatus_${currentUserId}_${result.user_id}`
          );

          // Set initial states from localStorage if available
          if (savedStatus !== null) setIsSaved(JSON.parse(savedStatus));
          if (followStatus !== null) setIsFollowing(JSON.parse(followStatus));

          // Then verify with server
          await Promise.all([
            checkFollowStatus(result.user_id),
            checkSaveStatus(result.id),
          ]);
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
    <div className="min-h-screen relative">
      <PageNavbar />
      <div className="xl:flex xl:h-[95vh]">
        <div className="xl:w-3/4  xl:h-full h-[620px]">
          <ProductImages
            images={getImagePaths(data.image)}
            productName={data.name}
            baseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
          />
        </div>
        <div className="xl:w-1/4 xl:h-full xl:p-4  ">
          <ProductInfo
            name={data.name}
            price={data.price}
            description={data.description}
            isSaved={isSaved}
            onSave={handleSave}
          />
          {data && (
            <SellerInfo
              productId={data.user_id}
              username={data.username}
              profilePicture={data.profile_picture || ""}
              baseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              loading={loading}
            />
          )}
          <ProductDetails location={data.location} condition={data.condition} />
        </div>
      </div>
      <div className="z-[99999]">{/* <ChatBox /> */}</div>
    </div>
  );
}
