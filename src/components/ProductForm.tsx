"use client";
import React, { useState, useEffect } from "react";
import { FilePond, registerPlugin } from 'react-filepond';
import { createProduct } from "../services/api";
import { useRouter } from 'next/navigation';


import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const ProductForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    location: "Alangilan",
    condition: "Used"
  });
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      setTimeout(() => router.push("/login"), 2000);  // Redirect to login if not authenticated
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      const numValue = parseFloat(value);
      if (numValue >= 0 || value === "") {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setError("You must be logged in");
      setTimeout(() => router.push("/login"), 2000); 
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("price", formData.price);
    submitData.append("description", formData.description);
    submitData.append("location", formData.location);
    submitData.append("condition", formData.condition);
    submitData.append("userId", userId);
    
    files.forEach((fileItem, index) => {
    if (fileItem.file) {
      submitData.append("images", fileItem.file);
    }
    });

    try {
      await createProduct(submitData);
      
      // Reset form
      setFormData({
        name: "",
        price: "",
        description: "",
        location: "Alangilan",
        condition: ""
      });
      setFiles([]);
      
      // Show success message or redirect
      setTimeout(() => router.push("/profile"), 1000);
      setMessage('Created Successully');  // Redirect to products page after success
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        if (error.message.includes('not authorized')) {
          setTimeout(() => router.push("/login"), 2000); 
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {message && (
          <p className="mt-2 text-center text-green-500">{message}</p>
        )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded h-32"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Image:</label>
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          maxFiles={5}
          name="images"
          labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
          acceptedFileTypes={['image/*']}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Choose Location:</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="Alangilan">Alangilan</option>
          <option value="Pablo-Borbon">Pablo-Borbon</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Condition:</label>
        <select
          name="condition"
          value={formData.condition}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="Used">Used</option>
          <option value="New">New</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded transition-colors ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-bsutheme hover:bg-[hsl(358,84%,57%)] text-white'
        }`}
      >
        {isLoading ? 'Creating Product...' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;