// src/components/Navbar.tsx
"use client";
import Link from 'next/link';


const Navbar = () => {
 

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          Marketplace
        </Link>
        <div>
          {isLoggedIn ? (
            <>
              <Link href="/products" className="text-white mr-4">
                Products
              </Link>
              <button onClick={logout} className="text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white mr-4">
                Login
              </Link>
              <Link href="/register" className="text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;