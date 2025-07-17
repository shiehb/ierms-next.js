import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { UserManagementClient } from "@/components/users/user-management-client";
import { getUsers } from "@/app/actions/user-management";
import { getCurrentUser } from "@/lib/auth/server";
import { getFullName, getInitials } from "@/lib/auth/client";

import { redirect } from "next/navigation";

export default async function UserManagementPage() {
  // Get user session from server-side auth
  const userSession = await getCurrentUser();

  // Redirect if not authenticated
  if (!userSession) {
    redirect("/login");
  }

  // Fetch initial users data
  const initialData = await getUsers(
    undefined, // searchQuery
    undefined, // userLevelFilter
    1, // currentPage
    10 // pageSize
  );

  // Prepare user data for the navigation component
  const userData = {
    name: getFullName(
      userSession.first_name,
      userSession.last_name,
      userSession.middle_name
    ),
    email: userSession.email,
    avatar: userSession.avatar_url || "/avatars/default.jpg",
    initials: getInitials(userSession.first_name, userSession.last_name),
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Separator orientation="vertical" className="ml-auto h-4" />
          <div className="flex items-center gap-2 px-4">
            <NavUser user={userData} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-0">
          <UserManagementClient
            initialUsers={initialData.users}
            initialTotalCount={initialData.totalCount}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
