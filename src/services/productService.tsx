// src/services/productService.ts
import axios from 'axios';

interface CreateProductParams {
  name: string;
  price: number;
  description: string;
  image: string;
  location: string;
}

export const createProduct = async (params: CreateProductParams, token: string) => {
  const response = await axios.post('http://localhost:3000/api/products', params, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAllProducts = async () => {
  const response = await axios.get('http://localhost:3000/api/products');
  return response.data;
};