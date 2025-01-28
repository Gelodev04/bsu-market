"use client";
import {
  useState,
  useEffect,
  ReactNode,
  JSX,
  createContext,
  useContext,
} from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";

const NavbarScrollContext = createContext<boolean>(false);

interface CustomNavbarComponentProps {
  children: ReactNode;
}

export function useNavbarScroll() {
  return useContext(NavbarScrollContext);
}



export default function CustomNavbarComponent({
  children,
}: CustomNavbarComponentProps): JSX.Element {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <NavbarScrollContext.Provider value={isScrolled}>
      <Navbar
        className={`fixed  py-4 transition-all duration-200 ${
          isScrolled ? "bg-white text-black py-3" : "bg-transparent text-white"
        }`}
        shouldHideOnScroll
        isBlurred={false} 
      >
        {children}
        
      </Navbar>
    </NavbarScrollContext.Provider>
  );
}
