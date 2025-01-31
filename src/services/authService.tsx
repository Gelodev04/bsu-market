// src/services/authService.ts
import axios from 'axios';

interface RegisterUserParams {
  username: string;
  password: string;
  role: string;
}

interface LoginUserParams {
  username: string;
  password: string;
}

export const registerUser = async (params: RegisterUserParams) => {
  const response = await axios.post('http://localhost:3000/api/users/register', params);
  return response.data;
};

export const loginUser = async (params: LoginUserParams) => {
  const response = await axios.post('http://localhost:3000/api/users/login', params);
  return response.data;
};