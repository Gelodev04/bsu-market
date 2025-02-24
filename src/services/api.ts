// filepath: src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
withCredentials : true
});

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get(`/api/user`);
  return response.data;
};

export const getUserFollowing = async () => {
  const response = await api.get(`/api/following`);
  console.log(response.data);
  return response.data;
};

export const getUserSaved = async () => {
  const response = await api.get(`/api/saved`);
  return response.data;
};

export const createUser = async (user: {
  username: string;
  googleaccount: string;
  password: string;
  location: string;
}) => {
  const response = await api.post("/users", user);
  return response.data;
};

export const createProduct = async (product: FormData) => {
  const response = await api.post("/products", product, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data", // Ensure the content type is set
    },
    withCredentials: true,
  });

  return response.data;
};

export const registerUser = async (user: {
  username: string;
  googleaccount: string;
  password: string;
  location: string;
}) => {
  const response = await api.post("/register", user);
  return response.data;
};

export const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid login credentials");
  }

  return response.json();
};
