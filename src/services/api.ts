// filepath: src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getProductById = async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createUser = async (user: { username: string; googleaccount: string; password: string }) => {
    const response = await api.post('/users', user);
    return response.data;
};

export const createProduct = async (product: { name: string; price: number; description: string; image: string; location: string }) => {
    const response = await api.post('/products', product);
    return response.data;
};