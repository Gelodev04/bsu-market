"use client"
import { FC, ReactNode } from "react";
import { Checkbox } from "@heroui/react";


interface AppProps {
    children?: ReactNode;
    checked?: boolean;
  onChange?: (isSelected: boolean) => void;
}

export default function App({ children, checked, onChange, ...props }: AppProps) {
    return <Checkbox size="lg" color="danger" isSelected={checked} onValueChange={onChange} {...props} >{children}</Checkbox>;
};


