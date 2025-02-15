// filepath: src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
});

export const getProducts = async () => {
    const response = await api.get('/products');
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

export const createUser = async (user: { username: string; googleaccount: string; password: string, location: string  }) => {
    const response = await api.post('/users', user);
    return response.data;
};

export const createProduct = async (product: FormData) => {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    
    if (!token) {
        throw new Error('No token found');
    }

    const response = await api.post('/products', product, {
        headers: {
            'Authorization': `Bearer ${token}`,  // Add token to Authorization header
            'Content-Type': 'multipart/form-data',  // Ensure the content type is set
        }
    });
    
    return response.data;
};

export const registerUser = async (user: { username: string; googleaccount: string; password: string, location: string }) => {
    const response = await api.post('/register', user);
    return response.data;
};

export const loginUser = async (user: { username: string; password: string }) => {
    const response = await api.post('/login', user);
    return response.data;
};