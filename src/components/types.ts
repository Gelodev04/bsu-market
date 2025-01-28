// types.ts
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    orders: number | null;
  }
  