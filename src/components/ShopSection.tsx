"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";

interface Product {
  items: string;
  itemimage: { url: string }[];
  price: number;
  description: string;
}

interface Seller {
  items: string;
  itemimage: any;
  id: number;
  seller: {
    name: string;
    profileImage: string;
  };
  products: Product[];
  location: string;
}

interface ShopSectionProps {
  data: Seller[];
}

const ShopSection = ({ data }: ShopSectionProps) => {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const allProducts = data.flatMap((seller) =>
    seller.products.map((product, index) => ({
      ...product,
      id: `${seller.id}-${index}`,
      sellerName: seller.seller.name,
      sellerImage: seller.seller.profileImage,
      location: seller.location,
    }))
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = allProducts.slice(startIndex, endIndex);


  return (
    <div id="shop" className="mx-3 mt-10 relative">
      <div className="relative">
        <h2 className="text-[3rem]">Latest</h2>
        <div className="absolute bottom-[12px] -left-1 h-[3px] rounded-full bg-bsutheme w-[40px]"></div>
      </div>
      <div className="product-list grid grid-cols-2 gap-2 gap-y-4 mt-4">
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className="product-card  rounded  flex flex-col   relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[240px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors"
          >
            <Link href={`/product/${product.id}`}>
              <div className=" flex flex-col">
                {product.itemimage.length > 0 && (
                  <Image
                    className="object-cover w-full aspect-[4/3] rounded"
                    src={product.itemimage[0].url}
                    alt={product.items}
                    width={500}
                    height={500}
                  />
                )}
                <div className="-space-y-1 mt-1">
                  <span className="text-lg text-bsutheme font-medium ">
                    ₱{product.price.toFixed(0)}
                  </span>
                  <h3 className="text-sm  truncate">{product.items}</h3>
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
