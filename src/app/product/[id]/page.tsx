import PageNavbar from "@/components/PageNavbar";
import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CartSvg, RightArrow } from "@/assets/svgs/Svg";

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

        <div className="product-page mt-[5rem]">
          <Image
            className="h-[350px] object-cover"
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
          />
          <div className="px-4 mt-5">
            <span className="text-bsutheme">
              ₱<span className="text-3xl font-semibold">{product.price.toFixed(0)}</span>
            </span>
            <h1 className="text-xl font-medium mt-2">{product.name}</h1>
            <p className="py-1">{product.description}</p>
            <span className="font-semibold">
              {product.orders ? `${product.orders} sold` : "No sold yet"}
            </span>
          </div>
        </div>

        <div className="flex items-center mt-5 border-t border-b border-gray-300 py-2 mx-3 ">
          <div className="cursor-pointer flex items-center">
            <Image
              className="rounded-full w-[50px]"
              src={product.seller.profileImage}
              alt={product.seller.name}
              width={50}
              height={50}
            />
            <span className="ml-2  text-gray-700 text-md">
              {product.seller.name}
            </span>
          </div>
        </div>

        <div className="fixed font-medium bottom-0 flex justify-evenly px-5 py-3 w-full bg-bsutheme text-white">
          <button className=" duration-150 active:scale-110 flex items-center gap-1">
            <span>Add To Cart</span>
            <CartSvg />
          </button>
          <div className="h-[23px] w-[1px] bg-white"></div>
          <button className="active:scale-110 duration-150 flex items-center gap-1">
            <span>Buy Now</span>
            <RightArrow />
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
