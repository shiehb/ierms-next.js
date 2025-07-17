"use client";

import {
  ChevronsUpDown,
  LogOut,
  User,
  Moon,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/app/actions/auth";
import type { User as UserType } from "@/app/actions/user-management";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface NavUserProps {
  user: UserType;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  const userInitials = `${user.first_name?.[0] || ""}${
    user.last_name?.[0] || ""
  }`.toUpperCase();
  const displayName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src={user.avatar_url || undefined}
                  alt={displayName}
                />
                <AvatarFallback className="h-8 w-8 rounded-full">
                  {userInitials || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              {/* <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs capitalize">
                  {user.user_level}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" /> */}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.avatar_url || undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {userInitials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center w-full">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <Label htmlFor="theme-toggle">Dark Mode</Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={toggleTheme}
              />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
