import PageNavbar from "@/components/PageNavbar";
import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CartSvg, RightArrow, SaveSvg } from "@/assets/svgs/Svg";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  orders: number | null;
  seller: {
    name: string;
    profileImage: string;
  };
  location: string;
}

async function fetchProduct(id: string): Promise<Product | null> {
  const filePath = path.join(process.cwd(), "public/data/data.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const product = jsonData.find(
    (product: Product) => product.id.toString() === id
  );

  return product || null;
}

const ProductPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const product = await fetchProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="h-screen overflow-hidden relative">
        <PageNavbar />

        {/* PRODUCT */}

        <div className="product-page ">
          <Image
            className="h-[350px] w-full object-cover"
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
          />
          <div className="mx-4 ">
            <div className="w-full py-3 my-1  flex justify-between border-b border-gray-300">
              <span className="text-bsutheme">
                ₱
                <span className="text-3xl font-semibold">
                  {product.price.toFixed(0)}
                </span>
              </span>
              <span className="cursor-pointer">
                <SaveSvg />
              </span>
            </div>
            <h1 className="text-xl font-medium mt-2">{product.name}</h1>
            <p className="py-1 text-gray-600">{product.description}</p>
          </div>
        </div>

        {/* PROFILE */}

        <div className="flex items-center mt-2 border-t border-b border-gray-300 py-2 mx-3 ">
          <div className="cursor-pointer flex items-center">
            <Image
              className="rounded-full w-[50px]"
              src={product.seller.profileImage}
              alt={product.seller.name}
              width={50}
              height={50}
            />
            <span className="ml-2 mr-2  text-gray-700 text-md">
              {product.seller.name}
            </span>
            <button className="bg-bsutheme rounded text-white text-xs px-2 py-[1px]">
              Follow
            </button>
          </div>
        </div>

        {/* DETAILS */}

        <div className="mx-4">
          <h1 className="font-semibold mt-3 text-[1.3rem]">Details</h1>
          
        </div>

        {/* MESSAGE */}

        <div className="fixed font-medium bottom-0 flex justify-evenly px-5 py-3 w-full bg-bsutheme text-white">
          <button className=" duration-150 active:scale-110 flex items-center gap-1">
            <span>Message the Seller</span>
            <CartSvg />
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
