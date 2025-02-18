export interface ProductDetail {
    id: number;
    name: string;
    price: number;
    description?: string;
    user_id: number;
    username: string;
    profile_picture: string | null;
    email: string;
    image: string;
    location: string;
    condition: string;
    followers: number;
    products: Array<{
      id: number;
      user_id: number;
      name: string;
      price: number;
      image: string;
      description: string;
    }>;
  }

  

  