import React from 'react';
import ShopSection from "@/components/ShopSection";
import Navbar from "@/components/Navbar";
import HomeSection from "@/components/HomeSection";
import fs from 'fs';
import path from 'path';


async function fetchData() {
  const filePath = path.join(process.cwd(), 'public/data/data.json');
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return jsonData;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface MyPageProps {
  data: Product[]; 
}


export default async function Home() {
 const data = await fetchData();

  return (
    <div>
      <Navbar />
      <HomeSection />
      <ShopSection data={data} /> 
      
    </div>
  );
}
