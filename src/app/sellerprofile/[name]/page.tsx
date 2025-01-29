// app/sellerprofile/[name]/page.tsx
import PageNavbar from "@/components/PageNavbar";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";

interface Seller {
  id: number;
  seller: {
    name: string;
    profileImage: string;
    followers: number;
  };
  products: Array<{
    items: string;
    itemimage: { url: string }[];
    price: number;
    description: string;
  }>;
  location: string;
}

async function fetchSeller(name: string): Promise<Seller | null> {
  const filePath = path.join(process.cwd(), "public/data/data.json");
  const sellers = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return sellers.find((seller: Seller) => seller.seller.name === name) || null;
}

const SellerProfile = async ({ params }: { params: { name: string } }) => {
  const { name } = params;
  const seller = await fetchSeller(decodeURIComponent(name));

  if (!seller) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavbar />
      {/* Seller Profile Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center flex-col justify-center">
            <Image
              src={seller.seller.profileImage}
              alt={seller.seller.name}
              width={96}
              height={96}
              className="rounded-full w-24 h-24 object-cover"
            />
            <div className="">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  {seller.seller.name}
                </h1>
                <p className="text-gray-600 ">📍 {seller.location}</p>
              </div>
              
              <p className="text-center flex flex-col">
                <span>{seller.seller.followers}</span>
                <span>Followers</span>
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Products<span className="text-lg">({seller.products.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seller.products.map((product, index) => (
              <Link
                href={`/product/${seller.id}-${index}`}
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={product.itemimage[0].url}
                    alt={product.items}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.items}
                  </h3>
                  <p className="text-bsutheme text-xl font-bold mb-2">
                    ₱{product.price.toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
