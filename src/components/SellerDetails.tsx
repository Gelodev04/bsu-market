"use client";
import React, { useEffect, useState } from "react";
import { Seller } from "../types/Seller";
import Image from "next/image";

interface SellerDetailsProps {
  sellerId: number;
}

const SellerDetails: React.FC<SellerDetailsProps> = ({ sellerId }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/seller/${sellerId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch seller data");
        }
        const data: Seller = await response.json();
        setSeller(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch seller data");
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold">
        Products({seller?.products.length || 0})
      </h3>
      <div className="grid grid-cols-2 gap-2 gap-y-4 mt-4">
        {seller?.products.length ? (
          seller.products.map((product) => {
            const imagePaths = getImagePaths(product.image);
            return (
              <div
                className="rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1"
                key={product.id}
              >
                <Image
                  className="object-cover w-full aspect-[4/3] rounded"
                  src={`${process.env.NEXT_PUBLIC_API_URL}${imagePaths[0]}`}
                  alt={product.name}
                  width={150}
                  height={150}
                  priority
                />
                <h4 className="mt-3 text-lg font-medium">{product.name}</h4>
                <p>{product.description}</p>
                <p className="text-bsutheme font-semibold">
                  {" "}
                  ₱
                  {Number(product.price).toLocaleString("fil-PH", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            );
          })
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default SellerDetails;
