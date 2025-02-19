import { cookies } from "next/headers";

export async function fetchUserProfile() {
    const cookieStore = await cookies(); // Await the cookies function
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Ensures fresh data
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user profile");

    return response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
