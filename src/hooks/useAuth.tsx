"use client";
import { useState, useEffect } from "react";
export const useAuth = () => {
    const [currentUserId, setCurrentUserId] = useState<string>("");
    
    const getCurrentUser = async () => {
     
     
  
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
      
          setCurrentUserId(userData.id?.toString() || "");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
  
    useEffect(() => {
      getCurrentUser();
     
    }, []);


  
    return { currentUserId };
  };
  