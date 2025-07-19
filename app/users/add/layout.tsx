import React from "react";

export default function AddUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Add User</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">{children}</div>
      </div>
    </div>
  );
}