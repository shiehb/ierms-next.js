"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { UserTable } from "./user-table";
import { UserForm } from "./user-form";
import { useToast } from "@/hooks/use-toast";
import {
  getUsers,
  resetUserPassword,
  toggleUserActiveStatus,
  type User,
} from "@/app/actions/user-management";
import type { UserLevel } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserManagementClientProps {
  initialUsers: User[];
  initialTotalCount: number;
}

export function UserManagementClient({
  initialUsers = [],
  initialTotalCount = 0,
}: Partial<UserManagementClientProps>) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLevelFilter, setUserLevelFilter] = useState<UserLevel | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const { toast } = useToast();

  // Dialog states
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Alert dialog states
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<number | null>(null);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState<{
    id: number;
    currentStatus: boolean;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsFetchingUsers(true);
    try {
      const result = await getUsers(
        searchQuery || undefined,
        userLevelFilter === "all" ? undefined : userLevelFilter,
        currentPage,
        pageSize,
        sortBy,
        sortOrder
      );
      setUsers(result.users);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsFetchingUsers(false);
    }
  }, [
    searchQuery,
    userLevelFilter,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    toast,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, userLevelFilter]);

  const handleAddUserSuccess = () => {
    setIsAddUserDialogOpen(false);
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleEditUserSuccess = () => {
    setIsEditUserDialogOpen(false);
    fetchUsers();
  };

  const handleResetPassword = (userId: number) => {
    setUserToReset(userId);
    setResetConfirmOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!userToReset) return;

    try {
      const result = await resetUserPassword(userToReset);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setResetConfirmOpen(false);
      setUserToReset(null);
    }
  };

  const handleToggleActiveStatus = (userId: number, currentStatus: boolean) => {
    setUserToToggleStatus({ id: userId, currentStatus });
    setToggleConfirmOpen(true);
  };

  const confirmToggleActiveStatus = async () => {
    if (!userToToggleStatus) return;

    try {
      const result = await toggleUserActiveStatus(
        userToToggleStatus.id,
        userToToggleStatus.currentStatus
      );
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setToggleConfirmOpen(false);
      setUserToToggleStatus(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, their permissions, and account status
          </p>
        </div>

        <Dialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] md:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Add New User
              </DialogTitle>
              <DialogDescription className="text-base text-gray-500">
                Create a new user account. A default password will be assigned.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSuccess={handleAddUserSuccess}
              onCancel={() => setIsAddUserDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-2">
          <div>
            <UserTable
              users={users}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={currentPage}
              pageSize={pageSize}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userLevelFilter={userLevelFilter}
              setUserLevelFilter={setUserLevelFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isFetchingUsers={isFetchingUsers}
              onEditUser={handleEditUser}
              onResetPassword={handleResetPassword}
              onToggleActiveStatus={handleToggleActiveStatus}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent className="sm:max-w-[550px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Edit User
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Update the details for this user.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <UserForm
              initialData={currentUser}
              onSuccess={handleEditUserSuccess}
              onCancel={() => setIsEditUserDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Confirmation Dialog */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send a password reset code to this user's
              email?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              Send Reset Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate/Deactivate Confirmation Dialog */}
      <AlertDialog open={toggleConfirmOpen} onOpenChange={setToggleConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {userToToggleStatus?.currentStatus ? "deactivate" : "activate"}{" "}
              this user account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleActiveStatus}>
              {userToToggleStatus?.currentStatus ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
