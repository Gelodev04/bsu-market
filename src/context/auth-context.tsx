"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const DEFAULT_PROFILE_IMAGE = "/images/user.png";

interface UserProfile {
  profile_picture?: string;
  role?: string;
  username?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void; // ✅ Add this line
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  handleLogout: () => Promise<void>;
  loading: boolean;
  getProfileImage: () => string;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getProfileImage = (): string => {
    if (!userProfile?.profile_picture) return DEFAULT_PROFILE_IMAGE;

    // If the profile picture is already a full URL, return it
    if (userProfile.profile_picture.startsWith("http")) {
      return userProfile.profile_picture;
    }

    // Otherwise, prepend the API URL
    return `${process.env.NEXT_PUBLIC_API_URL}${userProfile.profile_picture}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserProfile(parsedUser);

      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUserProfile(userData);

          localStorage.setItem("userProfile", JSON.stringify(userData));
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
          localStorage.removeItem("userProfile");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Clear local storage and state
      localStorage.removeItem("userProfile");
      setIsLoggedIn(false);
      setUserProfile(null);

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userProfile,
        handleLogout,
        setIsLoggedIn,
        setUserProfile,
        loading,
        getProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { DEFAULT_PROFILE_IMAGE };
