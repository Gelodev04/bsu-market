"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
        const res = await axios.get("http://localhost:3001/admin/products/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data);
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

  const updateProductStatus = async (id: number, status: "Approved" | "Rejected"): Promise<void> => {
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
    <div>
      <h1>Pending Products</h1>
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Status: {product.status}</p>
            <Image src={`http://localhost:3001${product.image}`} alt={product.name} width={200} height={200}/>
            <button onClick={() => updateProductStatus(product.id, "Approved")}>
              Approve
            </button>
            <button onClick={() => updateProductStatus(product.id, "Rejected")}>
              Reject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingProducts;
