import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { canManageUsers } from "@/lib/auth/permissions";
import { UserManagementClient } from "@/components/users/user-management-client";
import { AccessDenied } from "@/components/auth/access-denied";
import { Skeleton } from "@/components/ui/skeleton";

function UserManagementSkeleton() {
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default async function UsersPage() {
  try {
    // Get current user
    const currentUser = await getCurrentUser();

    // Redirect to login if not authenticated
    if (!currentUser) {
      redirect("/login");
    }

    // Check if user has permission to manage users
    if (!canManageUsers(currentUser)) {
      return (
        <AccessDenied
          title="Administrator Access Required"
          message="You need administrator privileges to access the user management interface. Please contact your system administrator if you believe you should have access to this feature."
          showBackButton={true}
          showHomeButton={true}
        />
      );
    }

    // Check if user account is active
    if (!currentUser.is_active) {
      return (
        <AccessDenied
          title="Account Inactive"
          message="Your account has been deactivated. Please contact your administrator to reactivate your account."
          showBackButton={false}
          showHomeButton={false}
        />
      );
    }

    return (
      <div>
        <div className="space-y-4">
          <Suspense fallback={<UserManagementSkeleton />}>
            <UserManagementClient currentUser={currentUser} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in users page:", error);
    return (
      <AccessDenied
        title="Error Loading Page"
        message="An error occurred while loading the user management interface. Please try again or contact your administrator."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }
}
