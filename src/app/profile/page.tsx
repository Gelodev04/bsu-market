// filepath: src/app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Image from "next/image";
import Link from "next/link";
import { AddSvg } from "@/assets/svgs/Svg";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
        
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:3001/api/user", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUsername(data.username);
          setLocation(data.location);

          const productsResponse = await fetch("http://localhost:3001/api/products", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!productsResponse.ok) {
            throw new Error("Failed to fetch products");
          }
          const productsData = await productsResponse.json();
          setProducts(productsData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen">
      <PageNavbar />
      <div className="flex  pt-10 px-3 gap-2 flex-col border-b border-gray-400 pb-5">
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
            <p className="text-[2.5rem] font-medium capitalize ">{username}</p>
            <p className="capitalize">{location}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="w-[270px] cursor-pointer flex items-center justify-center bg-bsutheme h-[40px] rounded">
              <span className="text-white font-medium">Edit Profile</span>
            </div>
            <div className="w-[100px] cursor-pointer flex items-center justify-center bg-[#cecccc] h-[40px] rounded">
              <span onClick={handleLogout} className="text-black font-medium">
                Log out
              </span>
             
            </div>
            <Link href="/postproduct" className="fixed bottom-0 right-0 z-[999] m-4 cursor-pointer hover:outline hover:outline-2 hover:outline-white  rounded-full">
        <AddSvg />

        <div className="bg-white rounded-full w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      </Link>
          </div>
        </div>
      </div>


      <div className="pt-10 px-10">
        <h2 className="text-2xl font-semibold">Your Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5">
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border rounded-md p-4">
                <Image
                  className="w-full h-[200px] object-cover"
                  src={`http://localhost:3001${product.image}`}
                  alt={product.name}
                  width={500}
                  height={500}
                />
                <h3 className="mt-3 text-lg font-medium">{product.name}</h3>
                <p>{product.description}</p>
                <p className="text-green-600 font-semibold">${product.price}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
