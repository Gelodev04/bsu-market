// Import your component dynamically
"use client"; // To indicate that this component runs in the client-side
import dynamic from 'next/dynamic';

// Only load the ProductForm component on the client-side
const ProductForm = dynamic(() => import('@/components/ProductForm'), {
  ssr: false, // This disables server-side rendering for this component
});


import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageNavbar from '@/components/PageNavbar';

const NewProductPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Now we can safely access localStorage in the client-side
      const token = localStorage.getItem("token"); // Assuming you store the token in localStorage
      if (!token) {
        // If there is no token, redirect to the login page
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <div className='min-h-screen'>
      <PageNavbar/>
      <h1 className='text-center pt-1'>Create a New Product</h1>
      <ProductForm />
    </div>
  );
};

export default NewProductPage;
