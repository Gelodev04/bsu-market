"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";

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
  const itemsPerPage = 20; // Number of products to display per page
  const [currentPage, setCurrentPage] = useState(1); // State for current page

  // Function to change the current page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate the index of the first and last product to display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Slice the data to show only the products for the current page
  const displayedProducts = data.slice(startIndex, endIndex);

  return (
    <div id="shop" className="mx-3 mt-10 relative">
      <h2 className="text-[3rem]">Latest</h2>

      <div className="product-list grid grid-cols-2 gap-2">
        {displayedProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <div className="product-card bg-white rounded py-2 shadow-md flex flex-col h-[310px] relative hover:outline outline-2 hover:outline-bsutheme overflow-hidden cursor-pointer">
              <div className="px-2 flex flex-col">
                <Image
                  className="object-cover w-full h-[170px]"
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                />
                <h3 className="py-2 text-lg truncate">{product.name}</h3>
                <span className="text-lg text-bsutheme font-medium">
                  ₱{product.price.toFixed(0)}
                </span>
                <span className="text-sm">{product.orders} sold</span>
              </div>
              <div className="absolute bottom-0 px-3 flex w-full justify-between bg-bsutheme text-white py-1 text-sm">
                <button className="hover:scale-110 duration-150">Add to Cart</button>
                <div className="h-[23px] w-[1px] bg-white"></div>
                <button className="hover:scale-110 duration-150">Buy Now</button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="py-5">
        <CustomPagination
          currentPage={currentPage}
          total={Math.ceil(data.length / itemsPerPage)} // Total number of pages
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ShopSection;
