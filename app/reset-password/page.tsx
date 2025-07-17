import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react"; // Import Suspense

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { email?: string; token?: string };
}) {
  const email = searchParams.email;
  const token = searchParams.token;

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is missing required information. Please
              request a new password reset.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter and confirm your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Wrap ResetPasswordForm in Suspense if it uses searchParams directly */}
          <Suspense fallback={<div>Loading form...</div>}>
            <ResetPasswordForm email={email} token={token} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
