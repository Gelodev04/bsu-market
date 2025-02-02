// filepath: src/components/ProductForm.tsx
"use client";
import { useState } from 'react';
import { createProduct } from '../services/api';

const ProductForm = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [location, setLocation] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('location', location);
        if (image) {
            formData.append('image', image);
        }
        try {
            await createProduct(formData);
            alert('Product created successfully!');
            setName('');
            setPrice('');
            setDescription('');
            setImage(null);
            setLocation('');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Price:</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div>
                <label>Description:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div>
                <label>Image:</label>
                <input type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} required />
            </div>
            <div>
                <label>Location:</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <button type="submit">Create Product</button>
        </form>
    );
};

export default ProductForm;