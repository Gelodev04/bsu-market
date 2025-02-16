import type { Metadata } from "next";

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
      <body >{children}</body>
    </html>
  );
}
