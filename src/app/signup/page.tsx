// filepath: src/app/signup/page.tsx
"use client";
import { useState } from 'react';
import { registerUser } from '../../services/api';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [googleaccount, setGoogleAccount] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser({ username, googleaccount, password });
            alert('User registered successfully!');
            router.push('/login');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Failed to register user.');
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Google Account:</label>
                    <input type="text" value={googleaccount} onChange={(e) => setGoogleAccount(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpPage;