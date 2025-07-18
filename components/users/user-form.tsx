"use client";

import type React from "react";

import { useActionState, useEffect, useState } from "react";
import {
  createUser,
  updateUser,
  type User,
} from "@/app/actions/user-management";
import {
  SELECTABLE_USER_LEVELS,
  USER_LEVEL_DISPLAY_NAMES,
  type UserLevel,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
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
  accessibleUserLevels: UserLevel[]; // User levels that current user can assign
}

interface FormState {
  message: string;
  success: boolean;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    middleName?: string[];
    email?: string[];
    userLevel?: string[];
  };
}

export function UserForm({
  initialData,
  onSuccess,
  onCancel,
  accessibleUserLevels,
}: UserFormProps) {
  const isEditing = !!initialData;

  const initialState: FormState = {
    message: "",
    success: false,
    errors: {},
  };

  // Create wrapper functions that match the expected signature
  const createUserWrapper = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const email = formData.get("email") as string;
    const userLevel = formData.get("userLevel") as UserLevel;

    const result = await createUser({
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      email,
      user_level: userLevel,
    });

    return {
      message: result.message,
      success: result.success,
      errors: result.success ? undefined : { email: [result.message] },
    };
  };

  const updateUserWrapper = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    if (!initialData) {
      return {
        message: "No user data provided for update",
        success: false,
      };
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const email = formData.get("email") as string;
    const userLevel = formData.get("userLevel") as UserLevel;

    const result = await updateUser(initialData.id, {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      email,
      user_level: userLevel,
    });

    return {
      message: result.message,
      success: result.success,
      errors: result.success ? undefined : { email: [result.message] },
    };
  };

  const action = isEditing ? updateUserWrapper : createUserWrapper;
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
    if (!accessibleUserLevels.includes(userLevel as UserLevel)) {
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

  // Filter user levels based on what current user can assign
  const availableUserLevels = SELECTABLE_USER_LEVELS.filter((level) =>
    accessibleUserLevels.includes(level)
  );

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
                defaultValue={initialData?.user_level || availableUserLevels[0]}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a user level" />
                </SelectTrigger>
                <SelectContent>
                  {availableUserLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {USER_LEVEL_DISPLAY_NAMES[level]}
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
