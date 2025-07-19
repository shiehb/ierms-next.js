"use client";
import React from "react";
import EstablishmentForm from "@/components/establishments/establishment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddEstablishmentPage() {
  const handleSubmit = (data: any) => {
    // TODO: Save to Supabase
    console.log("Establishment submitted:", data);
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Left: Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Establishment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <EstablishmentForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
        {/* Right: Map */}
        <Card className="flex items-center justify-center min-h-[400px]">
          <CardContent className="flex items-center justify-center h-full w-full">
            {/* TODO: Replace with actual map component */}
            <span className="text-muted-foreground">Map will appear here</span>
          </CardContent>
        </Card>
      </div>
  );
} 