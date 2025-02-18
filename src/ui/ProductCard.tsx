// src/components/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    location: string;
    imagePaths: string[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, name, price, location, imagePaths } = product;
  const safeImagePaths = imagePaths || [];

  return (
    <div
      key={id}
      className="product-card rounded flex flex-col relative min-h-[200px]  cursor-pointer 
       pb-1  
     "
    >
      <Link href={`/productdetail/${id}`}>
        <div className="flex flex-col">
          {safeImagePaths.length > 0 && (
            <div className="relative">
              <Image
                className="object-cover w-full aspect-[4/3] rounded"
                src={`${process.env.NEXT_PUBLIC_API_URL}${safeImagePaths[0]}`}
                alt={name}
                width={500}
                height={500}
              />

              {/* Thumbnail indicators if there are multiple images */}
              {safeImagePaths.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                  +{imagePaths.length - 1}
                </div>
              )}
            </div>
          )}

          <div className="-space-y-1 mt-1">
            <span className="text-lg text-bsutheme font-medium">
              ₱
              {Number(price).toLocaleString("fil-PH", {
                maximumFractionDigits: 0,
              })}
            </span>
            <h3 className="text-sm truncate">{name}</h3>
            <p className="text-gray-700 text-xs">{location}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
