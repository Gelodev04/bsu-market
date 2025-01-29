"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";

interface Product {
  id: number;
  user_id: number;
  product_name: string;
  description: string;
  price: number;
}


const ShopSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };


    fetchProducts();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

 
  


  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
 

  return (
    <div id="shop" className="mx-3 mt-10 relative">
      <div className="relative">
        <h2 className="text-[3rem]">Latest</h2>
        <div className="absolute bottom-[12px] -left-1 h-[3px] rounded-full bg-bsutheme w-[40px]"></div>
      </div>
      
      {/* Error handling */}
      {error && <div className="text-red-500">{error}</div>}
      
      
        <div className="product-list grid grid-cols-2 gap-2 gap-y-4 mt-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[240px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors"
            >
              <Link href={`/product/${product.id}`}>
                <div className="flex flex-col">
                 
                    <Image
                      className="object-cover w-full aspect-[4/3] rounded"
                      src="/images/bike.jpg"
                      alt="image"
                      width={500}
                      height={500}
                    />
                
                  <div className="-space-y-1 mt-1">
                    <span className="text-lg text-bsutheme font-medium">
                      ₱{product.price}
                    </span>
                    <h3 className="text-sm truncate">{product.product_name}</h3>
                    <p className="text-gray-700 text-xs">{product.product_name}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
   
      
      {/* Pagination */}
      <div className="py-5">
        <CustomPagination
          currentPage={currentPage}
          total={Math.ceil(products.length / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ShopSection;
