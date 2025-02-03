"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import PageNavbar from "@/components/PageNavbar";
interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description?: string;
  // user fields
  username: string;
  email: string;
  image: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: { name: string };
}) {
  
  const { name } = useParams() as { name: string };
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!name) {
      setError("Product name is missing in the URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Retrieve the JWT token from localStorage (or another storage mechanism)
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User is not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3001/api/productdetail/${encodeURIComponent(name)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errMessage = await res.text();
          setError(errMessage || "Failed to fetch product details");
          setLoading(false);
          return;
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="h-screen">
      <PageNavbar/>
      
      {data ? (
        <div>
          <Image src={`http://localhost:3001${data.image}`}alt="product" width={500} height={500}/>
          <h2>{data.name}</h2>
          <p>
            <strong>Price:</strong> ${data.price}
          </p>
          {data.description && (
            <p>
              <strong>Description:</strong> {data.description}
            </p>
          )}
          <hr />
          <h3>Owner Information</h3>
          <p>
            <strong>Username:</strong> {data.username}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
        </div>
      ) : (
        <p>No product details available.</p>
      )}
    </div>
  );
}
