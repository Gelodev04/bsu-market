// Import your component dynamically
"use client"; // To indicate that this component runs in the client-side
import dynamic from 'next/dynamic';

// Only load the ProductForm component on the client-side
const ProductForm = dynamic(() => import('@/components/ProductForm'), {
  ssr: false, // This disables server-side rendering for this component
});


import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageNavbar from '@/components/PageNavbar';

import { useAuth } from "@/context/auth-context";

const NewProductPage = () => {
  const { isLoggedIn, userProfile, loading, getProfileImage, currentUserId } = useAuth();
  const router = useRouter();
 
useEffect(() => {
    if (!isLoggedIn && !loading) {
      router.push("/login");
    }
  }, [isLoggedIn, loading]);

  return (
    <div className='min-h-screen'>
      <PageNavbar/>
      <h1 className='text-center pt-1'>Create a New Product</h1>
      <ProductForm />
    </div>
  );
};

export default NewProductPage;
