"use client";
import CartNavbar from '@/components/CartNavbar';
import React, { useEffect, useState } from 'react';
import { useCart } from "@/components/CartContent";
import Image from 'next/image';
import { RemoveSvg } from '@/assets/svgs/Svg';


interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  
}

export default function Page() {
  const { cartItems, removeFromCart } = useCart() as unknown as { cartItems: CartItem[], removeFromCart: (id: number) => void };


 
  return (
    <div className='min-h-screen'>
      <CartNavbar />
      <ul className='mt-10'>
        {cartItems.map(item => (
          <li key={item.id} className='relative bg-white shadow-md h-[170px] flex items-center'>
            <div className='flex mx-5 py-1 gap-3'>
              <Image className='w-[140px] object-cover border border-black' width={500} height={500} src={item.image} alt='product' />
              <div className='flex flex-col gap-1 mt-1 w-full'>
                <span className='text-lg'>{item.name}</span>
                <span className="truncate w-[220px] overflow-hidden">{item.description}</span>
                <span className='text-bsutheme font-semibold'>${item.price}</span>
              </div>
              
              <button className='absolute bottom-3 right-3' onClick={() => removeFromCart(item.id)}><RemoveSvg /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}