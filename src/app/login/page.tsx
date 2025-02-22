// filepath: src/app/login/page.tsx
"use client";
import { useState } from "react";
import { loginUser } from "../../services/api";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/react";
import { useAuth } from "@/context/auth-context";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setUserProfile, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setIsLoading(true);

    try {
     await loginUser({ username, password });

     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await response.json();
    
    setUserProfile(userData);
      setIsLoggedIn(true);
      localStorage.setItem("userProfile", JSON.stringify(userData));

      setSuccess("Login successful!");
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      setError("Failed to log in.");
      setUsername("");
      setPassword("");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center max-w-[700px] mx-auto">
      <h1 className="text-[2rem] font-bold ">Login</h1>
      {(success || error) && (
        <p
          className={`mt-2 text-center ${
            success ? "text-green-500" : "text-red-500"
          }`}
        >
          {success || error}
        </p>
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
          className="w-full mt-2 bg-bsutheme hover:bg-[hsl(358,84%,55%)] active:bg-[hsl(358,84%,58%)] font-medium rounded-xl text-white py-3 relative flex justify-center items-center"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner className="z-[999]" color="default" size="sm" />
          ) : (
            "Login"
          )}
        </button>

        <div className="flex gap-1 justify-center">
          <span className="">Don't have an account?</span>
          <a href="/signup" className="text-bsutheme">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
