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

  return (
    <div
      key={id}
      className="product-card rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[200px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors pb-1"
    >
      <Link href={`/productdetail/${id}`}>
        <div className="flex flex-col">
          {imagePaths.length > 0 && (
            <div className="relative">
              <Image
                className="object-cover w-full aspect-[4/3] rounded"
                src={`http://localhost:3001${imagePaths[0]}`}
                alt={name}
                width={500}
                height={500}
              />

              {/* Thumbnail indicators if there are multiple images */}
              {imagePaths.length > 1 && (
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
