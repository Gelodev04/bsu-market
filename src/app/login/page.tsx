// filepath: src/app/login/page.tsx
"use client";
import { useState } from "react";
import { loginUser } from "../../services/api";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      const { token, userId } = await loginUser({ username, password });
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setMessage("Login successful!");
      setTimeout(() => router.push("/"), 1000); 
    } catch (error) {
      setMessage("Failed to log in.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold">Login</h1>

      {message && (
          <p className="mt-2 text-center text-red-500">{message}</p>
        )}

      <form className="w-full px-4 flex flex-col gap-2" onSubmit={handleSubmit}>
        <div>
          <Input
            color="danger"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            label="Username"
            type="text"
            variant="faded"
          />
        </div>

        <div>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            label="Password"
            type="password"
            variant="faded"
            color="danger"
          />
        </div>

        <button
          className="w-full mt-2 bg-bsutheme font-medium rounded-xl text-white py-3"
          type="submit"
        >
          Login
        </button>

        


        <div className="flex gap-1 justify-center">
          <span>Don't have an account?</span>
          <a href="/signup" className="text-bsutheme">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
