import React from 'react'
import Image from 'next/image'
import Link from 'next/link'


export default function HomeSection() {

  return (
    <main className=' min-h-screen'>
      <div className='relative h-screen'>
        <Image className='h-full w-full object-cover' src="/images/homeimage.jpg" alt="BSU" width={1000} height={1000}/>
        <div className='absolute inset-0 bg-black opacity-[0.6] text-white flex justify-center items-center'>
        </div>
        <div className='absolute inset-0  text-white flex justify-center items-center flex-col'>
          <h1 className='text-[3rem]  text-center font-thin'>Welcome, Spartans! Shop now for your school gear and more! </h1>
          <Link href="#shop" className='scroll-smooth'><button className='bg-bsutheme px-5 py-3 rounded text-sm hover:bg-[hsl(358,84%,55%)] duration-75'>Shop Now</button></Link>
        </div>
      </div>
    </main>
  )
}
