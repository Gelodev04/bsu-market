"use client";
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  location: string;
}

interface ShopSectionProps {
  products: Product[];
}

export default function ShopSection({ products }: ShopSectionProps) {
  const itemsPerPage = 15;

  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getImagePaths = (imageString: string | null) => {
    return imageString ? imageString.split(",") : [];
  };

  return (
    <div id="shop" className="mx-3 mt-10 relative">
      <div className="relative">
        <h2 className="text-[3rem]">Latest</h2>
        <div className="absolute bottom-[12px] -left-1 h-[3px] rounded-full bg-bsutheme w-[40px]"></div>
      </div>

      <div className="product-list grid grid-cols-2 gap-2 gap-y-4 mt-4 ">
        {currentProducts.map((product: any) => {
          const imagePaths = getImagePaths(product.image);

          return (
            <div
              key={product.id}
              className="product-card rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1"
            >
              <Link href={`/productdetail/${product.id}`}>
                <div className="flex flex-col">
                  {imagePaths.length > 0 && (
                    <div className="relative">
                      <Image
                        className="object-cover w-full aspect-[4/3] rounded"
                        src={`http://localhost:3001${imagePaths[0]}`}
                        alt={product.name}
                        width={500}
                        height={500}
                      />

                      {/* Thumbnail indicators if there are multiple images */}
                      {imagePaths.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          +{imagePaths.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="-space-y-1 mt-1">
                    <span className="text-lg text-bsutheme font-medium">
                      ₱
                      {Number(product.price).toLocaleString("fil-PH", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <h3 className="text-sm truncate ">
                      {product.name}
                    </h3>
                    <p className="text-gray-700 text-xs">{product.location}</p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
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
}
