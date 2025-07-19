"use client";

import { LogOut, User, Moon, Sun, UserIcon, KeyRound } from "lucide-react";
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
import { useState, useEffect, useCallback } from "react";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { getUserAvatarUrl, getUserInitials } from "@/lib/avatar-utils";

interface NavUserProps {
  user: UserType;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userInitials = getUserInitials(
    user.first_name,
    user.last_name,
    user.email
  );
  const displayName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  const loadAvatar = useCallback(async () => {
    setIsLoading(true);
    setImageError(false);

    try {
      const avatarUrl = await getUserAvatarUrl(user.email, user.avatar_url);
      setAvatarSrc(avatarUrl);
    } catch (error) {
      console.error("Failed to load avatar:", error);
      setImageError(true);
      setAvatarSrc(null);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, user.avatar_url]);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const shouldShowImage = avatarSrc && !imageError && !isLoading;

  const AvatarComponent = ({ className }: { className: string }) => (
    <Avatar className={className}>
      {shouldShowImage && (
        <AvatarImage
          src={avatarSrc || "/placeholder.svg"}
          alt={displayName}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={`${
          className.includes("rounded-full") ? "rounded-full" : "rounded-lg"
        } bg-primary/10 text-primary font-semibold text-sm`}
      >
        {isLoading ? (
          <div className="animate-pulse bg-muted rounded-full w-full h-full flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          userInitials
        )}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <AvatarComponent className="h-8 w-8 rounded-full" />
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
                <AvatarComponent className="h-8 w-8 rounded-full" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center w-full cursor-pointer"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <ChangePasswordDialog>
              <DropdownMenuItem
                className="flex items-center w-full cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
            </ChangePasswordDialog>
            <DropdownMenuItem className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <Label htmlFor="theme-toggle" className="cursor-pointer">
                  Dark Mode
                </Label>
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
              className="focus:bg-destructive/10 cursor-pointer"
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
