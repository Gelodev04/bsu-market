"use client";
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";
import { useState, useEffect } from "react";
import ProductCard from "@/ui/ProductCard";

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

export default function ShopSection({ products }: { products: any[] }) {
  const [itemsPerPage, setItemsPerPage] = useState(14);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsPerPage(20); // lg
      } else if (width >= 768) {
        setItemsPerPage(15); // md
      } else {
        setItemsPerPage(14); // default
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

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
    <div id="shop" className="mx-3 mt-10 relative lg:px-20 md:px-14 ">
      <div className="relative">
        <h2 className="text-[3rem]">Latest</h2>
        <div className="absolute bottom-[12px] -left-1 h-[3px] rounded-full bg-bsutheme w-[40px]"></div>
      </div>

      <div className="product-list grid grid-cols-2 gap-2 gap-y-4 mt-4 md:grid-cols-3  lg:grid-cols-4">
        {currentProducts.map((product: any) => {
          const imagePaths = getImagePaths(product.image);

          return (
            <div  key={product.id}   className=" outline-2 outline-bsutheme hover:outline rounded">
              <ProductCard
               
                product={{
                  ...product,
                  imagePaths,
                }}
              />
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
