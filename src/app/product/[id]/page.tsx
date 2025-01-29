
import PageNavbar from "@/components/PageNavbar";
import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CartSvg, RightArrow, SaveSvg } from "@/assets/svgs/Svg";
import Carousel from "@/ui/Carousel";
import Link from "next/link";

interface Product {
  products: any;
  items: string;
  itemimage: { url: string }[];
  price: number;
  description: string;
}

interface Seller {
  id: number;
  seller: {
    name: string;
    profileImage: string;
  };
  products: Product[];
  location: string;
}

async function fetchProduct(id: string): Promise<Seller | null> {
  const filePath = path.join(process.cwd(), "public/data/data.json");
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const seller = jsonData.find(
    (seller: Seller) => seller.id.toString() === id
  );

  return seller || null;
}

const ProductPage = async ({params}: { params: { id: string } }) => {
  const { id } = params;
  const [sellerId, productIndex] = id.split('-');
  const seller = await fetchProduct(sellerId);

  if (!seller) {
    notFound();
  }

  const product = seller.products[parseInt(productIndex)];

  return (
    <>
      <div className="h-screen overflow-hidden relative">
        <PageNavbar />

        {/* PRODUCT */}

        <div className="product-page ">
        <Carousel>
            {product.itemimage.map((image, index) => (
              <Image
                key={index}
                className="h-[350px] w-full object-cover"
                src={image.url}
                alt={`Product image ${index + 1}`}
                width={500}
                height={500}
              />
            ))}
          </Carousel>
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
            <h1 className="text-xl font-medium mt-2">{product.items}</h1>
            <p className="py-1 text-gray-600">{product.description}</p>
          </div>
        </div>

        {/* PROFILE */}

        <div className="flex items-center mt-2 border-t border-b border-gray-300 py-2 mx-3 ">
          <div className="cursor-pointer flex items-center">
            <Link className="flex items-center" href={`/sellerprofile/${encodeURIComponent(seller.seller.name)}`}>
              <Image
                className="rounded-full w-[50px]"
                src={seller.seller.profileImage}
                alt={seller.seller.name}
                width={50}
                height={50}
              />
              <span className="ml-2 mr-2  text-gray-700 text-md">
                {seller.seller.name}
              </span>
            </Link>
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
