"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";

interface SellerProfile {
  username: string;
  email: string;
  location: string;
  products: Array<{ id: number; name: string; price: number; image: string }>;
}

export default function SellerProfilePage() {

  const { username } = useParams();  // Retrieve the username from the URL query
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!username) return;

    const fetchSellerData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/seller/${username}`);
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
  }, [username]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <PageNavbar />
      {seller ? (
        <div className="px-5 py-3">
          <h1 className="text-2xl font-bold">{seller.username}</h1>
          <p>Email: {seller.email}</p>
          <p>Location: {seller.location}</p>

          <h2 className="text-xl font-semibold mt-5">Products</h2>
          <div className="grid grid-cols-2 gap-4">
            {seller.products.map((product, index) => (
              <div key={index} className="border p-4">
                <Image
                  className="w-full h-[200px] object-cover"
                  src={`http://localhost:3001/${product.image}`}
                  alt="product"
                  width={500}
                  height={500}
                />
                <h3 className="mt-2 text-lg font-medium">{product.name}</h3>
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
