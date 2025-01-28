import { LeftArrow } from '@/assets/svgs/Svg'
import React from 'react'
import Link from 'next/link'

interface CartNavbarProps {
    cartItemCount: number;
  }
export default function CartNavbar({cartItemCount}: CartNavbarProps) {
  return (
    <nav className='px-4 py-2 shadow-md'>
        <ul className='flex justify-between'>
            <li className='cursor-pointer'><Link href="/#shop"><LeftArrow/></Link></li>
            <li className='cursor-pointer'>Shopping Cart({cartItemCount})</li>
        </ul>
    </nav>
  )
}
