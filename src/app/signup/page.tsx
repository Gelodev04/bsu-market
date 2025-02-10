// filepath: src/app/signup/page.tsx
"use client";
import { useState } from "react";
import { registerUser } from "../../services/api";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/react";
import Link from "next/link";
const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [googleaccount, setGoogleAccount] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("alangilan");
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const checkUsernameAvailability = async (username: string) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/check-username/${username}`
      );
      if (res.status === 409) {
        setUsernameTaken(true);
      } else {
        setUsernameTaken(false);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (usernameTaken) {
      setError("Username is already taken. Please choose another one.");
      setIsSubmitting(false);
      return;
    }

    try {
      await registerUser({ username, googleaccount, password, location });
      setSuccess("User registered successfully!");
      
      setTimeout(() => {
      router.push("/login");
      }, 1000);

    } catch (error) {
      console.error("Error registering user:", error);
      setError("Failed to register user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    checkUsernameAvailability(newUsername); // Check availability as user types

    setError(null)
  };

  

  return (
    <div className="h-screen flex flex-col justify-center items-center ">
      <h1 className="text-[2rem] font-bold">Sign Up</h1>

      {error && (
        <div className="w-full max-w-md mb-4 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="w-full max-w-md mb-4 px-4 py-2 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form className="w-full px-4 flex flex-col gap-2 " onSubmit={handleSubmit}>
        <div>
          <Input
           color="danger"
            value={username}
            onChange={handleUsernameChange}
            required
            label="Username(Display Name)"
            type="Text"
            variant="faded"
          />

          {usernameTaken && (
            <p style={{ color: "red" }}>Username is already taken</p>
          )}
        </div>

        <div>
          <Input
            value={googleaccount}
            onChange={(e) => setGoogleAccount(e.target.value)}
            label="Gmail(optional)"
            type="email"
            variant="faded"
           color="danger"
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

        <div>
          <Select
            className=""
            label="Campus"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            color="danger"
            variant="faded"
          >
            {[
              { value: "alangilan", label: "Alangilan" },
              { value: "pablo-borbon", label: "Pablo Borbon" },
            ].map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <button 
          className={`w-full mt-2 font-medium rounded-xl text-white py-3 ${
            isSubmitting || usernameTaken 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-bsutheme hover:bg-bsutheme/90'
          }`} 
          type="submit" 
          disabled={isSubmitting || usernameTaken}
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </button>


        <div className="flex gap-1 justify-center">
          <span>Already have an account?</span>
          <Link  href="/login"><span className="text-bsutheme">Log in</span></Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpPage;
