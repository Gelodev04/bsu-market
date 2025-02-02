// filepath: src/components/ProductForm.tsx
"use client";
import { useState } from 'react';
import { createProduct } from '../services/api';

const ProductForm = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const product = { name, price: parseFloat(price), description, image, location };
        try {
            await createProduct(product);
            alert('Product created successfully!');
            setName('');
            setPrice('');
            setDescription('');
            setImage('');
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
                <label>Image URL:</label>
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required />
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