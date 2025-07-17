"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import {
  EditIcon,
  KeyRoundIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  SearchIcon,
  Loader2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/app/actions/user-management";
import type { UserLevel } from "@/lib/constants";
import { SELECTABLE_USER_LEVELS } from "@/lib/constants";
import { getInitials } from "@/lib/auth/client";

interface UserTableProps {
  users: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userLevelFilter: UserLevel | "all";
  setUserLevelFilter: (level: UserLevel | "all") => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isFetchingUsers: boolean;
  onEditUser: (user: User) => void;
  onResetPassword: (userId: number) => void;
  onToggleActiveStatus: (userId: number, currentStatus: boolean) => void;
}

// Define the table meta type with all required properties
interface TableMeta {
  onEditUser: (user: User) => void;
  onResetPassword: (userId: number) => void;
  onToggleActiveStatus: (userId: number, currentStatus: boolean) => void;
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      const initials = getInitials(user.first_name, user.last_name);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.avatar_url || "/placeholder.svg"}
              alt={user.first_name || "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {user.first_name} {user.middle_name ? `${user.middle_name}. ` : ""}
            {user.last_name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "user_level",
    header: "Level",
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue("user_level")}</div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as TableMeta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta.onEditUser(user)}>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onResetPassword(user.id)}>
              <KeyRoundIcon className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta.onToggleActiveStatus(user.id, user.is_active)}
            >
              {user.is_active ? (
                <ToggleLeftIcon className="mr-2 h-4 w-4 text-red-500" />
              ) : (
                <ToggleRightIcon className="mr-2 h-4 w-4 text-green-500" />
              )}
              {user.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserTable({
  users,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  searchQuery,
  setSearchQuery,
  userLevelFilter,
  setUserLevelFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onPageChange,
  onPageSizeChange,
  isFetchingUsers,
  onEditUser,
  onResetPassword,
  onToggleActiveStatus,
}: UserTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: sortBy, desc: sortOrder === "desc" },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: users,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      if (typeof updater === "function") {
        const newSorting = updater(sorting);
        if (newSorting.length > 0) {
          setSortBy(newSorting[0].id);
          setSortOrder(newSorting[0].desc ? "desc" : "asc");
        }
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    meta: {
      onEditUser,
      onResetPassword,
      onToggleActiveStatus,
    } satisfies TableMeta,
  });

  const pageSizeOptions = [5, 10, 20, 50, 100];

  return (
    <div className="w-full space-y-2 min-h-[calc(100vh-165px)]">
      {/* Header Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={userLevelFilter}
            onValueChange={(value: UserLevel | "all") =>
              setUserLevelFilter(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {SELECTABLE_USER_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnName =
                    column.id === "user_level"
                      ? "User Level"
                      : column.id === "is_active"
                      ? "Status"
                      : column.id === "created_at"
                      ? "Joined"
                      : column.id;

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetchingUsers ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2 min-h-[calc(100vh-345px)]">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 "
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 min-h-[calc(100vh-345px)]">
                    <p className="text-muted-foreground">No users found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
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
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
