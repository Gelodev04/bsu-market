"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { UserData, Product } from "@/types/profile";
import Image from "next/image";
import Link from "next/link";

interface Props {

  followers: string;
}

const StatsSection: React.FC<Props> = ({ followers }) => {
  const [showFollowing, setShowFollowing] = useState(false);
  const [showSaves, setShowSaves] = useState(false);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [following, setFollowing] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchSavedProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/saved`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch following list");
        }

        const data = await response.json();

        setSavedProducts(data);
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    fetchSavedProducts();
  }, []);

  useEffect(() => {
      const fetchFollowing = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }
  
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/following`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch following list");
          }
  
          const data = await response.json();
          setFollowing(data);
        } catch (error) {
          console.error("Error fetching following list:", error);
        }
      };
  
      fetchFollowing();
    }, []);

  return (
    <div className="flex items-center justify-center gap-3 py-5">
      <div className="">
        <button
          className="rounded-md text-sm"
          onClick={() => setShowFollowing(!showFollowing)}
        >
          View Following
        </button>
        <Modal
          className="my-10 z-[9999]"
          isOpen={showFollowing}
          onOpenChange={setShowFollowing}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-center">
                  Following
                </ModalHeader>
                <ModalBody>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold">Following:</h3>
                    <ul className="mt-2 space-y-2">
                      {following.length === 0 ? (
                        <p>You are not following anyone yet.</p>
                      ) : (
                        following.map((seller) => (
                          <li
                            key={seller.id}
                            className="flex items-center gap-2"
                          >
                            <Image
                              src={
                                seller.profile_picture
                                  ? `${process.env.NEXT_PUBLIC_API_URL}${seller.profile_picture}`
                                  : "/images/user.png"
                              }
                              alt="seller"
                              className="w-10 h-10 rounded-full object-cover"
                              width={40}
                              height={40}
                            />
                            <Link
                              href={`/sellertest/${seller.id}`}
                              className="text-bsutheme hover:underline capitalize"
                            >
                              {seller.username}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => setShowFollowing(false)}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <p>{following.length}</p>
      </div>
      <div className="w-[1px] h-[2rem] bg-black"></div>
      {/* SAVES */}
      <div>
        <button
          className="rounded-md text-sm"
          onClick={() => setShowSaves(!showSaves)}
        >
          View Save Products
        </button>
        <Modal
          className="my-10 z-[9999]"
          isOpen={showSaves}
          onOpenChange={setShowSaves}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-center">
                  Following
                </ModalHeader>
                <ModalBody>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold">Saved Products:</h3>
                    <ul className="mt-2 space-y-2">
                      {savedProducts.length === 0 ? (
                        <p>You have no saved products.</p>
                      ) : (
                        savedProducts.map((product) => (
                          <li
                            key={product.id}
                            className="flex items-center gap-2"
                          >
                            <Image
                              src={
                                product.image
                                  ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
                                  : "/images/user.png"
                              }
                              alt={product.name}
                              className="w-10 h-10 rounded-full object-cover"
                              width={40}
                              height={40}
                            />
                            <div>
                              <p className="text-lg font-semibold">
                                {product.name}
                              </p>
                              <p className="text-gray-600">
                                {product.description}
                              </p>
                              <p className="text-bsutheme font-semibold">
                                ₱
                                {Number(product.price).toLocaleString(
                                  "fil-PH",
                                  {
                                    maximumFractionDigits: 0,
                                  }
                                )}
                              </p>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => setShowSaves(false)}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <p>{savedProducts.length}</p>
      </div>
      {/* FOLLOWERS */}
      <div className="w-[1px] h-[2rem] bg-black"></div>
      <div>
        <h1 className="text-sm">Followers</h1>
        <p>{followers}</p>
      </div>
    </div>
  );
};

export default StatsSection;
