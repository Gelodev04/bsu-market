const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  return await response.json();
};

export const createUser = async (user: {
  username: string;
  password: string;
  role: "user" | "admin";
  profileImage: string;
}) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return await response.json();
};

export const fetchProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  return await response.json();
};

export const createProduct = async (product: {
  name: string;
  price: number;
  description: string;
  image: string;
  location: string;
}) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return await response.json();
};
