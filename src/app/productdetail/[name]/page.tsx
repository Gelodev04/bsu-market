"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import PageNavbar from "@/components/PageNavbar";
import { SaveSvg } from "@/assets/svgs/Svg";
import Link from "next/link";


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
}

export default function ProductDetailPage() {
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

        const res = await fetch(
          `http://mysql.railway.internal/api/productdetail/${encodeURIComponent(name)}`
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
    <main className="h-screen">
      <PageNavbar />

      {data ? (
        <div>
          <Image
          className="w-full h-[400px] object-cover"
            src={`http://mysql.railway.internal${data.image}`}
            alt="product"
            width={500}
            height={500}
          />

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
              <SaveSvg/>
            </div>
          </div>
            
          {/* SELLER SECTION */}

          <div className="border-b border-t border-gray-300  mt-5 px-5 py-2">
            <div className="flex items-center  justify-between">
              <Link href={`/seller/${data.username}`} className="flex items-center gap-2">
                <img className="w-[60px] rounded-full" src="/images/seller1.jpg" alt="" />
                <h1 className="capitalize text-lg">{data.username}</h1>
              </Link>
              <button className="bg-bsutheme text-white rounded-full px-3 text-sm py-[1px]">Follow</button>
            </div>
          </div>

        {/* DETAILS SECTION */}

          <div className="px-3 pt-5">
            <h1 className="font-semibold text-[1.5rem]">Details</h1>
            <p><span className="font-medium">Location: </span>{data.location}</p>
            <p><span className="font-medium">Condition: </span>{data.location}</p>
          </div>


        </div>
      ) : (
        <p>No product details available.</p>
      )}
    </main>
  );
}
