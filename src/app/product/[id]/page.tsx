import PageNavbar from "@/components/PageNavbar";
import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  orders: number | null;
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
      <div className="min-h-screen overflow-hidden">
        <PageNavbar />
        <div className="product-page mt-12">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
          />
          <div className="px-3 mt-5">
            <span className="text-bsutheme">
              ₱<span className="text-3xl font-semibold">{product.price}</span>
            </span>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <span>Orders: {product.orders}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
