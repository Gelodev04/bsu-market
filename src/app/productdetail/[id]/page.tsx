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
import { getProducts } from '@/services/api';






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

  const checkSaveStatus = async (productId: number) => {
    console.log("Checking follow status for userId:", productId); // Add this line
    console.log("Current user ID:", currentUserId); // Add this line
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/save/status/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const { isSaved } = await res.json();
        setIsSaved(isSaved);
        // Store follow status with both the current user ID and the followed username
        localStorage.setItem(
          `saveStatus_${currentUserId}_${productId}`,
          JSON.stringify(isSaved)
        );
      }
    } catch (error) {
      console.error("Error checking save status:", error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) {
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const newSaveStatus = !isSaved;
        setIsSaved(newSaveStatus);
        localStorage.setItem(
          `saveStatus_${currentUserId}_${data?.id}`,
          JSON.stringify(newSaveStatus)
        );
      } else {
        const errMessage = await res.text();
        alert(`Error: ${errMessage}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occured");
      }
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUserId) {
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
          `followStatus_${currentUserId}_${data?.user_id}`,
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
      if (data?.user_id) {
        const storedFollowStatus = localStorage.getItem(
          `followStatus_${currentUserId}_${data.user_id}`
        );
        if (storedFollowStatus) {
          setIsFollowing(JSON.parse(storedFollowStatus));
        }
        checkFollowStatus(data.user_id); // Re-check follow status from the server
      }

      if (data?.id) {
        const storedSaveStatus = localStorage.getItem(
          `saveStatus_${currentUserId}_${data.id}`
        );
        if (storedSaveStatus) {
          setIsSaved(JSON.parse(storedSaveStatus));
        }
        checkSaveStatus(data.id); // Re-check save status from the server
      }
    }
  }, [data?.user_id, data?.id, currentUserId]);

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
        console.log(result);
        setData(result);
        console.log()
        if (result.id && currentUserId) {
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
    <main className="min-h-screen">
      <PageNavbar />
      <ProductImages
        images={getImagePaths(data.image)}
        productName={data.name}
        baseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
      />
      <ProductInfo
        name={data.name}
        price={data.price}
        description={data.description}
        isSaved={isSaved}
        onSave={handleSave}
      />
      {data && (
        <SellerInfo
        productId={data.id}
          username={data.username}
          profilePicture={data.profile_picture || ""}
          baseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          loading={loading}
        />
      )}
      <div className="z-[99999]">
        <ChatBox />
      </div>
      <ProductDetails location={data.location} condition={data.condition} />
    </main>
  );
}

