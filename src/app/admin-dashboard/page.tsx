"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageNavbar from "@/components/PageNavbar";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  image: string;
}

const PendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Verify admin status
        await axios.get("http://localhost:3001/api/check-admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIsAdmin(true);

        // Fetch products only if admin
        const res = await axios.get(
          "http://localhost:3001/admin/products/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sortedProducts = res.data.sort((a: Product, b: Product) => b.id - a.id);

        setProducts(sortedProducts);
      } catch (error) {
        console.error("Access denied:", error);
        router.push("/login");
      }
    };

    verifyAdmin();
  }, [router]);

  // Only render if admin
  if (!isAdmin) {
    return null;
  }

  const updateProductStatus = async (
    id: number,
    status: "Approved" | "Rejected"
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/admin/products/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh the list after status change
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token from localStorage
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="min-h-screen ">
      <PageNavbar />
      <div className="px-3">
        <h1 className="text-center">Pending Products</h1>
        <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
          Logout
        </button>
        <ul className="grid grid-cols-2 gap-2 gap-y-4 mt-4">
          {products.map((product: any) => (
            
              <li
                className="product-card rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1"
                key={product.id}
              >
                <Image
                  className="object-cover w-full aspect-[4/3] rounded"
                  src={`http://localhost:3001${product.image}`}
                  alt={product.name}
                  width={500}
                  height={500}
                />
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <p>Status: {product.status}</p>
                <div className="flex items-center justify-center gap-5 font-semibold z-[9999]">
                  <button className="hover:underline decoration-bsutheme decoration-2"
                    onClick={() => updateProductStatus(product.id, "Approved")}
                  >
                    Approve
                  </button>
                  <button className="hover:underline decoration-bsutheme decoration-2"
                    onClick={() => updateProductStatus(product.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              </li>
          
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PendingProducts;
