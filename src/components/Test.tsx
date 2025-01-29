// src/app/shop/page.js
"use client";

import React, { useEffect, useState } from "react";

interface Product {
    id: number;
    user_id: number;
    product_name: string;
    description: string;
    price: number;
    // Add any other fields if needed
  }

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Shop Page</h1>
      {error && <div>{error}</div>}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h3>{product.product_name}</h3>
            <p>{product.description}</p>
            <span>{product.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShopPage;
