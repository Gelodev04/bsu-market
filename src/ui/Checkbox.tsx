"use client"
import { FC, ReactNode } from "react";
import { Checkbox } from "@heroui/react";


interface AppProps {
    children?: ReactNode;
}

export default function App({ children }: AppProps) {
    return <Checkbox size="lg" color="danger" >{children}</Checkbox>;
};


