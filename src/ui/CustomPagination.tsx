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
        page={currentPage} // Pass the current page here
        total={total} // Pass the total number of pages here
        showControls
        onChange={onPageChange} // Handle page changes
        color="danger"
      />
    </div>
  );
}
