// filepath: src/app/profile/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            // Fetch user data using the token if needed
            // For simplicity, we'll just set a dummy username
            setUsername('John Doe');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div>
            <h1>Profile</h1>
            <p>Welcome, {username}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default ProfilePage;