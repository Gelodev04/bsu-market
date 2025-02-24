import Link from "next/link";
import Image from "next/image";
import {Skeleton} from "@heroui/react";

interface SellerInfoProps {
    username: string;
    profilePicture: string;
    baseUrl: string;
    isFollowing: boolean;
    onFollow: () => void;
    loading: boolean;
    productId: number;
  }
  
  export const SellerInfo = ({ username, profilePicture, baseUrl, isFollowing, onFollow, loading, productId }: SellerInfoProps) => (
    <div className="border-b border-t border-gray-300 mt-5 px-5 py-2">
        
      <div className="flex items-center justify-between">
        
        <Link href={`/sellertest/${productId}`} className="flex items-center gap-2">
        {loading ? (
          <Skeleton className="rounded-full w-12 h-12">
           
            <div />
          </Skeleton>
        ) : (
          <Image
            width={60}
            height={60}
            className="rounded-full"
            src={`${baseUrl}${profilePicture}` || "/images/user.png"}
            alt="profile"
          />
        )}
          <h1 className=" text-lg">{username}</h1>
        </Link>
        <button
          onClick={onFollow}
          className={`rounded-full px-3 text-sm py-[1px] text-white ${
            isFollowing
              ? "bg-gray-500 lg:hover:bg-[hsl(220,9%,42%)] active:bg-[hsl(220,9%,42%)]"
              : "bg-bsutheme lg:hover:bg-[hsl(358,84%,62%)] active:bg-[hsl(358,84%,62%)]"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );