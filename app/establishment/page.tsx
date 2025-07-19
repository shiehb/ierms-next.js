"use client";
import React from "react";
import EstablishmentTable from "@/components/establishments/establishment-table";

export default function EstablishmentListPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Establishments</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <EstablishmentTable />
      </div>
    </div>
  );
} 