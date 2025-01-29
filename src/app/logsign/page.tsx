"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
  const router = useRouter();
  
  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const url = isLogin ? '/api/login' : '/api/signup';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      if (isLogin) {
        // Handle successful login
        router.push('/');
      } else {
        // Handle successful sign-up
        alert('Sign-up successful! Please log in.');
        setIsLogin(true); // Switch to login form
      }
    } else {
      alert(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {/* Toggle between Login and Signup */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
            {isLogin ? 'Login' : 'Sign Up'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-600">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-600">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button type="submit" className={`w-full ${isLogin ? 'bg-blue-500' : 'bg-green-500'} text-white py-2 rounded-md`}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-4 text-center text-gray-600">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500"
            >
              {isLogin ? 'Don’t have an account? Sign Up' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}