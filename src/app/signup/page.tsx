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
    if (usernameTaken) {
      alert("Username is already taken. Please choose another one.");
      return;
    }
    try {
      await registerUser({ username, googleaccount, password, location });
      alert("User registered successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Failed to register user.");
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    checkUsernameAvailability(newUsername); // Check availability as user types
  };

  const animals = [
    { key: "cat", label: "Cat" },
    { key: "dog", label: "Dog" },
  ];

  return (
    <div className="h-screen flex flex-col justify-center items-center ">
      <h1 className="text-[2rem] font-bold">Sign Up</h1>
      <form className="w-[450px] flex flex-col gap-2 " onSubmit={handleSubmit}>
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
            label="Location"
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

        <button className="w-full mt-2 bg-bsutheme font-medium rounded-xl text-white py-3" type="submit" disabled={usernameTaken}>
          Sign Up
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
