// src/types/Seller.ts
export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    location: string;
    image: string;
  }
  
  export interface Seller {
    id: number;
    username: string;
    location: string;
    profile_picture: string;
    followers: number;
    products: Product[];
  }
  