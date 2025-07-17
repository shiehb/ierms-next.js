"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link"; // Import Link

export default function LoginPage() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams ? searchParams.get("resetSuccess") : null;

  useEffect(() => {
    if (resetSuccess === "true") {
      // You could show a toast or a temporary message here
      console.log(
        "Password has been successfully reset. Please log in with your new password."
      );
    }
  }, [resetSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-lg">
        <div className="mb-8 text-center w-full">
          <h1 className="scroll-m-20 text-center text-2xl font-extrabold tracking-tight text-balance ">
            Integrated Establishment Regulatory Management System
          </h1>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-bold">
              Log Into Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resetSuccess === "true" && (
              <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm">
                Password has been successfully reset. Please log in with your
                new password.
              </div>
            )}
            <LoginForm />
            <div className="mt-4 text-center">
              <Button variant="link" className="text-sm" asChild>
                <Link href="/forgot-password">Forgot Password?</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
