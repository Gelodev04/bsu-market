
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "@/styles/pagination.css";

interface ProductImagesProps {
  images: string[];
  productName: string;
  baseUrl: string;
}

export const ProductImages = ({ images, productName, baseUrl }: ProductImagesProps) => (
  <Swiper spaceBetween={1} slidesPerView={1} pagination={true} modules={[Pagination]}>
    {images.map((imagePath, index) => (
      <SwiperSlide key={index}>
        <Image
          className="w-full h-[400px] object-cover"
          src={`${baseUrl}${imagePath}`}
          alt={`${productName} - Image ${index + 1}`}
          width={500}
          height={500}
        />
      </SwiperSlide>
    ))}
  </Swiper>
);