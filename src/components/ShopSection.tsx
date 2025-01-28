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
  image: string;
  category: string;
  orders: number | null;
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
          <div key={product.id} className="product-card bg-white rounded py-2 shadow-md flex flex-col h-[310px] relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme  overflow-hidden cursor-pointer">
              <Link href={`/product/${product.id}`} >
              <div className="px-2 flex flex-col">
                <Image
                  className="object-cover w-full h-[170px]"
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                />
                <h3 className="pt-2 text-lg truncate">{product.name}</h3>
                <span className="text-lg text-bsutheme font-medium mb-1">
                  ₱{product.price.toFixed(0)}
                </span>
                <span className="text-sm">{product.orders ? `${product.orders} sold` : 'No sold yet'}</span>
              </div>
          </Link>
              <div className="absolute bottom-0 px-2 flex w-full justify-evenly bg-bsutheme text-white py-1 text-sm">
                <button onClick={()=> addToCart({ ...product, quantity: 1 })} className="lg:hover:scale-110 active:scale-110 duration-150">Add to Cart</button>
                <div className="h-[23px] w-[1px] bg-white"></div>
                <button className="lg:hover:scale-110 active:scale-110 duration-150">Buy Now</button>
              </div>
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
