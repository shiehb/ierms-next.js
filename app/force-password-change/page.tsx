import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForcePasswordChangeForm } from "@/components/auth/force-password-change-form";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ForcePasswordChangePage() {
  const cookieStore = cookies();
  const authSession = cookieStore.get("auth_session");

  if (!authSession) {
    redirect("/login"); // Not logged in, redirect to login
  }

  const userId = authSession.value;

  // Verify if the user actually needs to change password
  let needsChange = false;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("force_password_change")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (user) {
      needsChange = user.force_password_change;
    }
  } catch (e) {
    console.error("Failed to check force_password_change status:", e);
    // If there's an error, assume they need to change for security, or redirect to login
    redirect("/login");
  }

  if (!needsChange) {
    redirect("/dashboard"); // Already changed password, redirect to dashboard
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Change</CardTitle>
          <CardDescription>
            You are required to change your password before proceeding. Please
            set a new strong password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForcePasswordChangeForm userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
