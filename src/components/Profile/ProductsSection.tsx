"use client";
import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/profile';
import { useState } from 'react';
import Checkbox from "@/ui/Checkbox";

    interface Props {
        products: Product[];
    }

    export const ProductsSection: React.FC<Props> = ({products}) => {
        const [showSelect, setShowSelect] = useState<boolean>(false);
        const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
        const [isDeleting, setIsDeleting] = useState(false);
        const [localProducts, setLocalProducts] = useState<any[]>([]);

        const handleShowSelect = () => {
            setShowSelect((prev) => !prev);
        }

        const handleProductSelect = (productId: string) => {
            setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
            });
        };


        const handleDeleteSelected = async () => {
            if (selectedProducts.size === 0) return;
        
            const token = localStorage.getItem("token");
            if (!token) return;
        
            setIsDeleting(true); //added
            
            try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/delete`, {
                method: "DELETE",
                headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                productIds: Array.from(selectedProducts)
                })
            });
        
            if (!response.ok) {
                throw new Error("Failed to delete products");
            }
        
            // Update products list by removing deleted items
            setLocalProducts(prev => prev.filter(product => !selectedProducts.has(product.id)));
            setSelectedProducts(new Set());
            setShowSelect(false);
            } catch (error) {
            console.error("Error deleting products:", error);
            // Handle error appropriately - maybe show a toast notification
            } finally {
            setIsDeleting(false);
            }
        };

        const getImagePaths = (imageString: string | null) => {
            return imageString ? imageString.split(",") : [];
        };
    
  return (
    <div className="pt-10 px-6">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              Your Products({products.length})
            </h2>
            {showSelect && selectedProducts.size > 0 && (
               <button 
               className="bg-red-500 text-sm text-white px-4 py-1 rounded-full disabled:opacity-50"
               onClick={handleDeleteSelected}
               disabled={isDeleting}
             >
              
               {isDeleting ? "Deleting..." : `Delete (${selectedProducts.size})`}
             </button>
            )}
            <button className="bg-bsutheme text-sm text-white px-2 py-1 rounded-full" onClick={handleShowSelect}>{showSelect ? "Cancel" : "Select"}</button>
          </div>

          <div className="grid grid-cols-2 gap-2 gap-y-4 mt-4">
            {products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              products.map((product) => {
                const imagePaths = getImagePaths(product.image);
                return (
                  <div key={product.id} className="rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1">
                    { showSelect && (
                  <div  className="absolute z-[9999] pt-1 pl-1" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}>
                    <Checkbox checked={selectedProducts.has(product.id)}
                        onChange={() => handleProductSelect(product.id)}/>
                  </div>
                    )}
                      {imagePaths.length > 0 && (
                        <Link href={`/productdetail/${product.id}`}>
                          <div className="relative">
                            <Image
                              className="object-cover w-full aspect-[4/3] rounded"
                              src={`${process.env.NEXT_PUBLIC_API_URL}${imagePaths[0]}`}
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
                        </Link>
                      )}
                      <h3 className="mt-3 text-lg font-medium">
                        {product.name}
                      </h3>
                      <p>{product.description}</p>
                      <p className="text-bsutheme font-semibold">
                        ₱
                        {Number(product.price).toLocaleString("fil-PH", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    
                    
                    </div>
                  );
              })
            )}
          </div>
        </div>
  )
}
