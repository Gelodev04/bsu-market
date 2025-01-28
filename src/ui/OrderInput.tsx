"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/components/CartContent";
import "@/styles/order-input.css"

const Counter = ({ productId }: { productId: number }) => {
  const { cartItems } = useCart();
  const [count, setCount] = useState(0);

 
  useEffect(() => {
    const productInCart = cartItems.find((item) => item.id === productId);
    if (productInCart) {
      setCount(productInCart.quantity);
    }
  }, [cartItems, productId]);

  return (
    <div className="order-input rounded">
      <button className="text-bsutheme" onClick={() => setCount(Math.max(0, count - 1))}>-</button>
      <input
        className="text-center bg-transparent outline-none"
        value={count}
        readOnly
        style={{ width: "40px" }}
      />
      <button className="text-bsutheme" onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
};

export default Counter;
