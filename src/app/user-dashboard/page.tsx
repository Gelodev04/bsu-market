// filepath: /c:/Users/Admin/Desktop/VSCode/PersonalProjects/bsu-market/src/app/user-dashboard/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import PageNavbar from '@/components/PageNavbar';

const UserDashboard = () => {
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      const fetchUser = async () => {
        try {
          const response = await axios.get('http://localhost:3000/api/users/getUser', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user:', error.message);
          console.error('Stack trace:', error.stack);
        }
      };

      fetchUser();
    }
  }, [isLoggedIn, router, token]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen">
      <PageNavbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
        <div className="mb-4">
          <img src={`http://localhost:3000/uploads/${user.profile_image}`} alt="Profile" className="w-32 h-32 rounded-full" />
        </div>
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;