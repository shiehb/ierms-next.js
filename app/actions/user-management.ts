"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { USER_LEVELS, type UserLevel } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/server";
import { canManageUsers } from "@/lib/auth/permissions";
import { queueManager } from "@/lib/queue/queue-manager";

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  user_level: string;
  is_active: boolean;
  force_password_change: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetUsersResult {
  users: User[];
  totalCount: number;
  totalPages: number;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

const TOKEN_EXPIRATION_MINUTES = 15;

// Helper function for validation
function validateUserData(
  data: {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    userLevel?: string;
  },
  isNewUser: boolean
): { [key: string]: string[] } | undefined {
  const errors: { [key: string]: string[] } = {};

  if (!data.firstName) {
    errors.firstName = ["First name is required."];
  }
  if (!data.lastName) {
    errors.lastName = ["Last name is required."];
  }
  if (!data.middleName) {
    errors.middleName = ["Middle name is required."];
  }
  if (!data.email || !data.email.includes("@")) {
    errors.email = ["Please enter a valid email address."];
  }
  if (data.userLevel && !USER_LEVELS.includes(data.userLevel as UserLevel)) {
    errors.userLevel = ["Invalid user level selected."];
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

// Avatar upload function
export async function uploadAvatar(
  file: File,
  userId: number
): Promise<ActionResult> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await createServiceClient()
      .storage.from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, message: "Failed to upload avatar" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = createServiceClient().storage.from("avatars").getPublicUrl(filePath);

    // Update user's avatar_url in database
    const { error: updateError } = await createServiceClient()
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return { success: false, message: "Failed to update avatar in database" };
    }

    revalidatePath("/profile");
    revalidatePath("/users");

    return { success: true, message: "Avatar uploaded successfully!" };
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      message: `Failed to upload avatar: ${error.message}`,
    };
  }
}

// Delete avatar function
export async function deleteAvatar(userId: number): Promise<ActionResult> {
  try {
    // Get current avatar URL
    const { data: userData, error: fetchError } = await createServiceClient()
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (fetchError) {
      return { success: false, message: "Failed to fetch user data" };
    }

    // Remove avatar_url from database
    const { error: updateError } = await createServiceClient()
      .from("users")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (updateError) {
      return {
        success: false,
        message: "Failed to remove avatar from database",
      };
    }

    // Delete file from storage if it exists
    if (userData.avatar_url) {
      const filePath = userData.avatar_url.split("/").pop();
      if (filePath) {
        await createServiceClient()
          .storage.from("avatars")
          .remove([`avatars/${filePath}`]);
      }
    }

    revalidatePath("/profile");
    revalidatePath("/users");

    return { success: true, message: "Avatar removed successfully!" };
  } catch (error: any) {
    console.error("Avatar deletion error:", error);
    return {
      success: false,
      message: `Failed to remove avatar: ${error.message}`,
    };
  }
}

/**
 * Check if current user has admin permissions
 */
async function requireAdminAccess(): Promise<boolean> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Authentication required");
  }

  if (!canManageUsers(currentUser)) {
    throw new Error("Administrator access required");
  }

  return true;
}

/**
 * Get users with filtering, sorting, and pagination
 */
export async function getUsers(
  searchQuery?: string,
  userLevelFilter?: UserLevel,
  currentPage = 1,
  pageSize = 10,
  sortBy = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  statusFilter?: boolean
): Promise<GetUsersResult> {
  try {
    // Check admin access
    await requireAdminAccess();

    const supabase = createServiceClient();
    const offset = (currentPage - 1) * pageSize;

    // Build the query
    let query = supabase.from("users").select("*", { count: "exact" });

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
      );
    }

    // Apply user level filter
    if (userLevelFilter && userLevelFilter !== "all") {
      query = query.eq("user_level", userLevelFilter);
    }

    // Apply status filter
    if (statusFilter !== undefined) {
      query = query.eq("is_active", statusFilter);
    }

    // Apply sorting with special handling for name column
    let orderColumn = sortBy;
    if (sortBy === "name") {
      // For name sorting, we'll sort by first_name primarily
      orderColumn = "first_name";
    }

    query = query.order(orderColumn, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      users: users || [],
      totalCount: count || 0,
      totalPages,
    };
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  user_level: UserLevel;
}): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAccess();

    // Add to queue for processing
    await queueManager.addAction({
      type: "CREATE_USER",
      data: userData,
      priority: 1,
    });

    return {
      success: true,
      message: "User creation has been queued for processing",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: number,
  userData: {
    email?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    user_level?: UserLevel;
  }
): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAccess();

    // Add to queue for processing
    await queueManager.addAction({
      type: "UPDATE_USER",
      data: { userId, ...userData },
      priority: 1,
    });

    return {
      success: true,
      message: "User update has been queued for processing",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Reset user password
 */
export async function resetUserPassword(userId: number): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAccess();

    // Add to queue for processing
    await queueManager.addAction({
      type: "RESET_PASSWORD",
      data: { userId, isAdminReset: true },
      priority: 2, // Higher priority for password resets
    });

    return {
      success: true,
      message: "Password reset has been queued for processing",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserActiveStatus(
  userId: number,
  currentStatus: boolean
): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAccess();

    const supabase = createServiceClient();

    // Update user status
    const { error } = await supabase
      .from("users")
      .update({
        is_active: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error("Failed to update user status");
    }

    revalidatePath("/users");

    return {
      success: true,
      message: `User ${
        !currentStatus ? "activated" : "deactivated"
      } successfully`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user status",
    };
  }
}

/**
 * Delete a user (soft delete by deactivating)
 */
export async function deleteUser(userId: number): Promise<ActionResult> {
  try {
    // Check admin access
    await requireAdminAccess();

    const supabase = createServiceClient();

    // Soft delete by deactivating the user
    const { error } = await supabase
      .from("users")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error("Failed to delete user");
    }

    revalidatePath("/users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  try {
    // Check admin access
    await requireAdminAccess();

    const supabase = createServiceClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}
