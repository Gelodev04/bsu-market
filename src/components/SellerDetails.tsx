// src/components/SellerDetails.tsx
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

  return (
    <div>
      <h3>Products:</h3>
      {seller?.products.length ? (
        seller.products.map((product) => (
          <div key={product.id}>
            <h4>{product.name}</h4>
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
              alt={product.name}
              width={150}
              height={150}
              priority
            />
            <p>Price: ${product.price}</p>
            <p>{product.description}</p>
          </div>
        ))
      ) : (
        <p>No products available</p>
      )}
    </div>
  );
};

export default SellerDetails;
