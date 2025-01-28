"use client";
import CartNavbar from '@/components/CartNavbar';
import { useCart } from "@/components/CartContent";
import Image from 'next/image';
import { RemoveSvg } from '@/assets/svgs/Svg';
import OrderInput from '@/ui/OrderInput';


interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  
}

export default function Page() {
  const { cartItems, removeFromCart } = useCart() as unknown as { cartItems: CartItem[], removeFromCart: (id: number) => void };

  const cartItemCount = cartItems.length;
 
  return (
    <>
        
    <div className='min-h-screen overflow-hidden '>
      <CartNavbar cartItemCount={cartItemCount}/>
      <ul className='mt-10 flex flex-col gap-2'>
        {cartItems.map(item => (
            <li key={item.id} className='relative bg-white shadow-md h-[170px] flex items-center'>
            <div className='flex mx-5 py-1 gap-3'>
              <Image className='w-[140px] object-cover shadow' width={500} height={500} src={item.image} alt='product' />
              <div className='flex flex-col gap-1 mt-1 w-full justify-center'>
                <span className='text-lg'>{item.name}</span>
               
                <span className='text-bsutheme font-semibold text-xl'>${item.price}</span>
              </div>
              
              
            </div>
            
                <div className='absolute bottom-3 right-[3rem]'><OrderInput productId={item.id}/></div>
                <button className='absolute bottom-3 right-3' onClick={() => removeFromCart(item.id)}><RemoveSvg /></button>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}