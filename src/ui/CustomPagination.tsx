"use client";
import { Pagination } from "@heroui/react";

interface CustomPaginationProps {
  currentPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function CustomPagination({
  currentPage,
  total,
  onPageChange,
}: CustomPaginationProps) {
  return (
    <div className="flex justify-center items-center">
      <Pagination
        page={currentPage} 
        total={total} 
        showControls
        onChange={onPageChange} 
        color="danger"
      />
    </div>
  );
}
