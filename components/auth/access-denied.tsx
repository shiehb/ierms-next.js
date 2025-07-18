"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You do not have permission to view this page. Please contact your administrator for assistance.",
  showBackButton = true,
  showHomeButton = true,
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-500">
            {title}
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {showBackButton && (
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          )}
          {showHomeButton && (
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
