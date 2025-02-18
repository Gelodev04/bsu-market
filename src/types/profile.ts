
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  createdAt: string;
}

export interface UserData {
  id: number;
  username: string;
  location: string;
  followers: string;
  profile_picture: string | null; // Allow profile_picture to be null
}