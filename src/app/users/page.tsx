import { useEffect, useState } from "react";
import { fetchUsers } from "@/services/api";

interface User {
  id: number;
  username: string;
  role: string;
  profileImage: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
    };
    getUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.role}
            <img src={user.profileImage} alt={`${user.username} profile`} width={50} />
          </li>
        ))}
      </ul>
    </div>
  );
}
