"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "@/styles/pagination.css"


import { ReactNode } from "react";

export default function Carousel({ children = [] }: { children?: ReactNode }) {
  return (
    <>
        <Swiper
      spaceBetween={1} 
      slidesPerView={1} 
      pagination={true} 
      modules={[Pagination]}
    >
      {Array.isArray(children) && children.map((child, index) => (
        <SwiperSlide key={index}>{child}</SwiperSlide>
      ))}
    </Swiper>
    </>
  );
}
