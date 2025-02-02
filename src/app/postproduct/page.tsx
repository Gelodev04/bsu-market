"use client"; // To indicate that this component runs in the client-side

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";

const NewProductPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming you store the token in localStorage
    if (!token) {
      // If there is no token, redirect to the login page
      router.push("/login");
    }
  }, [router]);

  return (
    <div>
      <h1>Create a New Product</h1>
      <ProductForm />
    </div>
  );
};

export default NewProductPage;
