"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UserTable } from "./user-table";
import { UserForm } from "./user-form";
import type { User } from "@/app/actions/user-management";
import { USER_LEVEL_DISPLAY_NAMES } from "@/lib/constants";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getUsers,
  resetUserPassword,
  toggleUserActiveStatus,
} from "@/app/actions/user-management";
import { canEditUser, getAccessibleUserLevels } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserManagementClientProps {
  currentUser: User;
}

// Local storage keys for persistence
const STORAGE_KEYS = {
  SEARCH_QUERY: "userManagement.searchQuery",
  USER_LEVEL_FILTER: "userManagement.userLevelFilter",
  STATUS_FILTER: "userManagement.statusFilter",
  SORT_BY: "userManagement.sortBy",
  SORT_ORDER: "userManagement.sortOrder",
  PAGE_SIZE: "userManagement.pageSize",
  COLUMN_VISIBILITY: "userManagement.columnVisibility",
};

// Helper functions for localStorage
const getStoredValue = (key: string, defaultValue: any): any => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredValue = (key: string, value: any): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};

export function UserManagementClient({
  currentUser,
}: UserManagementClientProps) {
  // State management
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter and sorting state with persistence
  const [searchQuery, setSearchQuery] = useState(() =>
    getStoredValue(STORAGE_KEYS.SEARCH_QUERY, "")
  );
  const [userLevelFilter, setUserLevelFilter] = useState(() =>
    getStoredValue(STORAGE_KEYS.USER_LEVEL_FILTER, "all")
  );
  const [statusFilter, setStatusFilter] = useState(() =>
    getStoredValue(STORAGE_KEYS.STATUS_FILTER, [])
  );
  const [sortBy, setSortBy] = useState(() =>
    getStoredValue(STORAGE_KEYS.SORT_BY, "created_at")
  );
  const [sortOrder, setSortOrder] = useState(() =>
    getStoredValue(STORAGE_KEYS.SORT_ORDER, "desc")
  );
  const [pageSize, setPageSize] = useState(() =>
    getStoredValue(STORAGE_KEYS.PAGE_SIZE, 10)
  );
  const [columnVisibility, setColumnVisibility] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_VISIBILITY, {})
  );

  // Persist state changes to localStorage
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SEARCH_QUERY, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.USER_LEVEL_FILTER, userLevelFilter);
  }, [userLevelFilter]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.STATUS_FILTER, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SORT_BY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SORT_ORDER, sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.PAGE_SIZE, pageSize);
  }, [pageSize]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_VISIBILITY, columnVisibility);
  }, [columnVisibility]);

  // Get accessible user levels for current user
  const accessibleUserLevels = useMemo(() => {
    return getAccessibleUserLevels(currentUser);
  }, [currentUser]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (userLevelFilter !== "all") count++;
    if (statusFilter.length > 0) count++;
    return count;
  }, [searchQuery, userLevelFilter, statusFilter]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilter([...statusFilter, status]);
    } else {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    }
  };

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    setIsFetchingUsers(true);
    try {
      // Convert status filter array to boolean or undefined
      const statusFilterValue =
        statusFilter.length === 1 ? statusFilter[0] === "active" : undefined;

      const result = await getUsers(
        searchQuery || undefined,
        userLevelFilter === "all" ? undefined : userLevelFilter,
        currentPage,
        pageSize,
        sortBy,
        sortOrder,
        statusFilterValue
      );

      setUsers(result.users);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingUsers(false);
    }
  }, [
    searchQuery,
    userLevelFilter,
    statusFilter,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  // Fetch users on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, userLevelFilter, statusFilter]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle user actions
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    // Check if current user can edit this user
    if (!canEditUser(currentUser, user)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this user.",
        variant: "destructive",
      });
      return;
    }

    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = async (userId: number) => {
    try {
      const result = await resetUserPassword(userId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActiveStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    try {
      const result = await toggleUserActiveStatus(userId, currentStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        fetchUsers(); // Refresh the user list
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the user list
    toast({
      title: "Success",
      description: selectedUser
        ? "User updated successfully!"
        : "User created successfully!",
    });
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <div>
      {/* Header */}
      <Card className="min-h-[calc(100vh-80px)]">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="text-sm">Active filters:</span>
                      {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                          Search: {searchQuery}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="h-auto p-0 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {userLevelFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                          Level: {userLevelFilter}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserLevelFilter("all")}
                            className="h-auto p-0 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {statusFilter.map((status) => (
                        <Badge
                          key={status}
                          variant="secondary"
                          className="gap-1"
                        >
                          Status: {status}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusFilterChange(status, false)
                            }
                            className="h-auto p-0 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleCreateUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
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
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
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
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            fetchUsers={fetchUsers}
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
              users
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={isFetchingUsers}
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetchingUsers ? "animate-spin" : ""}`}
              />
            </Button>
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will receive an email with
              their login credentials.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            accessibleUserLevels={accessibleUserLevels}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              initialData={selectedUser}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              accessibleUserLevels={accessibleUserLevels}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
