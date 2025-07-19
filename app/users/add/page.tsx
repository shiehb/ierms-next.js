import { getCurrentUser } from "@/lib/auth/server";
import { getAccessibleUserLevels } from "@/lib/auth/permissions";
import UserFormClient from "@/components/users/user-form-client";
import { redirect } from "next/navigation";

export default async function AddUserPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  const accessibleUserLevels = getAccessibleUserLevels({
    ...currentUser,
    user_level: currentUser.user_level as import("@/lib/constants").UserLevel,
  });

  return <UserFormClient accessibleUserLevels={accessibleUserLevels} />;
}
