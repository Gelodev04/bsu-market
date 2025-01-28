"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";
import { useCart } from "@/components/CartContent";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: { url: string}[];
  category: string;
  orders: number | null;
  location: string;
}

interface ShopSectionProps {
  data: Product[];
}

const ShopSection = ({ data }: ShopSectionProps) => {
  const itemsPerPage = 20; 
  const [currentPage, setCurrentPage] = useState(1); 
  const { addToCart} = useCart();


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

 
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

 
  const displayedProducts = data.slice(startIndex, endIndex);

  return (
    <div id="shop" className="mx-3 mt-10 relative">
      <h2 className="text-[3rem]">Latest</h2>

      <div className="product-list grid grid-cols-2 gap-2 gap-y-4">
        {displayedProducts.map((product) => (
          <div key={product.id} className="product-card  rounded  flex flex-col h-[240px] relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme  overflow-hidden cursor-pointer">
              <Link href={`/product/${product.id}`} >
              <div className=" flex flex-col">
              {product.images.length > 0 && (
                  <Image
                   
                    className="object-cover w-full h-[170px] rounded"
                    src={product.images[0].url}
                    alt={product.name}
                    width={500}
                    height={500}
                  />
              )}
                <div className="-space-y-1 mt-1">
                  <span className="text-lg text-bsutheme font-medium ">
                    ₱{product.price.toFixed(0)}
                  </span>
                  <h3 className="text-sm  truncate">{product.name}</h3>
                  <p className="text-gray-700 text-xs">{product.location}</p>
                </div>
              </div>
          </Link>
              
            </div>
        ))}
      </div>

 
      <div className="py-5">
        <CustomPagination
          currentPage={currentPage}
          total={Math.ceil(data.length / itemsPerPage)} 
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ShopSection;
