"use client";

import type React from "react";

import { useActionState, useEffect, useState } from "react";
import {
  createUser,
  updateUser,
  type User,
} from "@/app/actions/user-management";
import { SELECTABLE_USER_LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface UserFormProps {
  initialData?: User; // For editing existing users
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!initialData;
  const action = isEditing ? updateUser : createUser;

  const initialState = {
    message: "",
    success: false,
    errors: {},
  };
  const [state, formAction] = useActionState(action, initialState);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const isProperlyCapitalized = (name: string): boolean => {
    return name
      .split(/\s+/)
      .every(
        (word) =>
          word === word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
  };

  const formatName = (name: string): string => {
    return name
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Get form values
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const userLevel = formData.get("userLevel") as string;

    // Perform client-side validation
    const errors: Record<string, string[]> = {};

    // Name validation
    if (!firstName) {
      errors.firstName = ["First name is required."];
    } else if (!isProperlyCapitalized(firstName)) {
      errors.firstName = [
        "First name must be properly capitalized (e.g., John Doe).",
      ];
    }

    if (!lastName) {
      errors.lastName = ["Last name is required."];
    } else if (!isProperlyCapitalized(lastName)) {
      errors.lastName = [
        "Last name must be properly capitalized (e.g., John Doe).",
      ];
    }

    if (!middleName) {
      errors.middleName = ["Middle name is required."];
    } else if (!isProperlyCapitalized(middleName)) {
      errors.middleName = [
        "Middle name must be properly capitalized (e.g., John Doe).",
      ];
    }

    // Email validation
    if (!email) {
      errors.email = ["Email is required."];
    } else if (!email.includes("@")) {
      errors.email = ["Please enter a valid email address."];
    } else if (email !== email.toLowerCase()) {
      errors.email = ["Email must be in lowercase."];
    }

    // User level validation
    if (!SELECTABLE_USER_LEVELS.includes(userLevel as any)) {
      errors.userLevel = ["Invalid user level selected."];
    }

    if (Object.keys(errors).length > 0) {
      // If validation fails, update state to show errors immediately
      formAction(formData);
      return;
    }

    // Format values properly before submission
    const formattedFormData = new FormData();
    if (isEditing) formattedFormData.append("id", formData.get("id") as string);
    formattedFormData.append("firstName", formatName(firstName.trim()));
    formattedFormData.append("lastName", formatName(lastName.trim()));
    formattedFormData.append("middleName", formatName(middleName.trim()));
    formattedFormData.append("email", email.trim().toLowerCase());
    formattedFormData.append("userLevel", userLevel);

    setPendingFormData(formattedFormData);
    setShowConfirmation(true);
  };

  const confirmAction = () => {
    if (pendingFormData) {
      formAction(pendingFormData);
    }
    setShowConfirmation(false);
    setPendingFormData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {isEditing && (
            <input type="hidden" name="id" value={initialData.id} />
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="items-center gap-4 ">
              <Label htmlFor="firstName" className="text-right">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialData?.first_name || ""}
                required
                aria-invalid={state.errors?.firstName ? "true" : "false"}
                aria-describedby={
                  state.errors?.firstName ? "firstName-error" : undefined
                }
              />
              {state.errors?.firstName && (
                <p
                  id="firstName-error"
                  className="col-span-4 col-start-2 text-sm text-red-500"
                >
                  {state.errors.firstName.join(", ")}
                </p>
              )}
            </div>
            <div className="items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialData?.last_name || ""}
                required
                aria-invalid={state.errors?.lastName ? "true" : "false"}
                aria-describedby={
                  state.errors?.lastName ? "lastName-error" : undefined
                }
              />
              {state.errors?.lastName && (
                <p
                  id="lastName-error"
                  className="col-span-4 col-start-2 text-sm text-red-500"
                >
                  {state.errors.lastName.join(", ")}
                </p>
              )}
            </div>
            <div className="items-center gap-4">
              <Label htmlFor="middleName" className="text-right">
                Middle Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="middleName"
                name="middleName"
                defaultValue={initialData?.middle_name || ""}
                required
                aria-invalid={state.errors?.middleName ? "true" : "false"}
                aria-describedby={
                  state.errors?.middleName ? "middleName-error" : undefined
                }
              />
              {state.errors?.middleName && (
                <p
                  id="middleName-error"
                  className="col-span-4 col-start-2 text-sm text-red-500"
                >
                  {state.errors.middleName.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email || ""}
                required
                aria-invalid={state.errors?.email ? "true" : "false"}
                aria-describedby={
                  state.errors?.email ? "email-error" : undefined
                }
              />
              {state.errors?.email && (
                <p
                  id="email-error"
                  className="col-span-4 col-start-2 text-sm text-red-500"
                >
                  {state.errors.email.join(", ")}
                </p>
              )}
            </div>
            <div className="items-center gap-4">
              <Label htmlFor="userLevel" className="text-right">
                User Level <span className="text-red-500">*</span>
              </Label>
              <Select
                name="userLevel"
                defaultValue={
                  initialData?.user_level || SELECTABLE_USER_LEVELS[0]
                }
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a user level" />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_USER_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.userLevel && (
                <p
                  id="userLevel-error"
                  className="col-span-4 col-start-2 text-sm text-red-500"
                >
                  {state.errors.userLevel.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 h-16 items-center">
            {state.message && (
              <p
                className={`col-span-4 text-center text-sm ${
                  state.success ? "text-green-500" : "text-red-500"
                }`}
              >
                {state.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Create User"}
          </Button>
        </CardFooter>
      </form>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditing ? "Confirm Edit User" : "Confirm Add User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {isEditing ? "save changes to this user" : "create this new user"}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {isEditing ? "Confirm Changes" : "Confirm Create"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
