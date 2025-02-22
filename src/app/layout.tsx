import type { Metadata } from "next";
import { AuthProvider } from '@/context/auth-context';
import "./globals.css";



export const metadata: Metadata = {
  title: "BSU Market",
  description: "Marketplace for BSU students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
