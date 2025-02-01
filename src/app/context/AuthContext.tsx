"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { validateFile } from '@/utils/fileValidation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
    id: number;
    username: string;
    role: string;
    profileImage: string;
    token: string;
  }

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, role: string, profileImage: File) => Promise<void>;
}

interface LoginResponse {
    message: string;
    token: string;
    user: {
      id: number;
      username: string;
      role: string;
      profileImage: string;
    }
  } 

  interface RegisterResponse {
    message: string;
    user: {
      id: number;
      username: string;
      role: string;
      profileImage: string;
    }
  }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.token) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Invalid server response');
      }

      const data: LoginResponse = await res.json();
      const userData = {
        ...data.user,
        token: data.token
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      router.push(userData.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const register = async (username: string, password: string, role: string, profileImage: File) => {
    try {
      validateFile(profileImage);
  
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('profileImage', profileImage);
  
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        body: formData,
      });
  
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format');
      }
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};