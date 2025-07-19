import { getUserById } from "@/app/actions/user-management";
import { getCurrentUser } from "@/lib/auth/server";
import { getAccessibleUserLevels } from "@/lib/auth/permissions";
import UserFormClient from "@/components/users/user-form-client";
import { redirect } from "next/navigation";

interface EditUserPageProps {
  params: { id: string };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  const accessibleUserLevels = getAccessibleUserLevels({
    ...currentUser,
    user_level: currentUser.user_level as import("@/lib/constants").UserLevel,
  });
  const user = await getUserById(Number(params.id));
  if (!user) redirect("/users");

  return (
    <UserFormClient
      initialData={user}
      accessibleUserLevels={accessibleUserLevels}
    />
  );
}
