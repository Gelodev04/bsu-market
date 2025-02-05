
import Image from "next/image";
import Link from "next/link";
import CustomPagination from "@/ui/CustomPagination";
import { getProducts } from '@/services/api';


interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  location: string;
}

export default async function ShopSection()  {
  const products = await getProducts();
 

  return (
    <div id="shop" className="mx-3 mt-10 relative">
      <div className="relative">
        <h2 className="text-[3rem]">Latest</h2>
        
        <div className="absolute bottom-[12px] -left-1 h-[3px] rounded-full bg-bsutheme w-[40px]"></div>
      </div>
      
    
      
      
        <div className="product-list grid grid-cols-2 gap-2 gap-y-4 mt-4">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="product-card rounded flex flex-col relative hover:outline outline-2 hover:outline-bsutheme active:outline-bsutheme min-h-[240px] overflow-hidden cursor-pointer active:bg-gray-300 duration-150 transition-colors"
            >
              <Link href={`/productdetail/${product.name}`}>
                <div className="flex flex-col">
                 {product.image && 
                    <Image
                      className="object-cover w-full aspect-[4/3] rounded"
                      src={`http://localhost:3001${product.image}`}
                      alt={product.name}
                      width={500}
                      height={500}
                    />}
                  <div className="-space-y-1 mt-1">
                    <span className="text-lg text-bsutheme font-medium">
                      ₱{product.price}
                    </span>
                    <h3 className="text-sm truncate capitalize">{product.name}</h3>
                    <p className="text-gray-700 text-xs">{product.location}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
          
      
      {/* Pagination */}
     {/* <div className="py-5">
        <CustomPagination
          currentPage={currentPage}
          total={Math.ceil(products.length / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      </div>
      */}
    </div>
  );
  
};


