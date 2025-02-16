"use client";
import { getProducts } from '@/services/api';
import ShopSection from './ShopSection';
import { useState, useEffect } from 'react';

export default function ShopSectionWrapper() {
  const [products, setProducts] = useState([]);

  // Fetch products on the client side
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);
  return <ShopSection products={products} />;
}