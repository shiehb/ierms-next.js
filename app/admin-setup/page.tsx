import { CardContent } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { AdminSignupForm } from "@/components/admin/admin-signup-form";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminSetupPage() {
  let isAdminSetupComplete = false;
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    isAdminSetupComplete = (count && count > 0) || false;
  } catch (e) {
    console.error("Failed to check admin existence:", e);
    // In a real app, you might want to handle this more gracefully,
    // e.g., show a database connection error.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      {isAdminSetupComplete ? (
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Admin Setup Complete</CardTitle>
            <CardDescription>
              The initial administrator account has already been created. This
              setup page is no longer accessible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please proceed to the login page to access your admin dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AdminSignupForm />
      )}
    </div>
  );
}
