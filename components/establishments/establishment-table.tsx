
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Establishment {
  id: number;
  name: string;
  businessType: string;
  yearEstablished: number;
  address: string;
}

const allEstablishments: Establishment[] = [
  {
    id: 1,
    name: "Acme Corp.",
    businessType: "Manufacturing",
    yearEstablished: 2001,
    address: "Quezon City, Metro Manila, Philippines",
  },
  {
    id: 2,
    name: "Bayanihan Cafe",
    businessType: "Food & Beverage",
    yearEstablished: 2015,
    address: "Makati City, Metro Manila, Philippines",
  },
  // Add more sample data as needed
];

export default function EstablishmentTable() {
  // State for pagination, sorting, and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof Establishment>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering
  const filtered = allEstablishments.filter(est =>
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalCount = sorted.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handlers
  const handleSort = (column: keyof Establishment) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("name")}>Name</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("businessType")}>Nature of Business</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("yearEstablished")}>Year Established</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("address")}>Address</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((est) => (
              <tr key={est.id}>
                <td className="px-4 py-2 whitespace-nowrap font-medium">{est.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{est.businessType}</td>
                <td className="px-4 py-2 whitespace-nowrap">{est.yearEstablished}</td>
                <td className="px-4 py-2 whitespace-nowrap">{est.address}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <Button size="sm" variant="outline">Edit</Button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted-foreground">No establishments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} establishments
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 ml-2"
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 