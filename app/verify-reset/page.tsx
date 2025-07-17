import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerifyCodeForm } from "@/components/auth/verify-code-form";
import { Suspense } from "react"; // Import Suspense

export default function VerifyResetPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const initialEmail = searchParams.email || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Verify Reset Code</CardTitle>
          <CardDescription>
            Enter the 6-character code sent to your email address to verify your
            identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Wrap VerifyCodeForm in Suspense if it uses searchParams directly */}
          <Suspense fallback={<div>Loading form...</div>}>
            <VerifyCodeForm initialEmail={initialEmail} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
