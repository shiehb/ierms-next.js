"use client";
import { useRouter } from "next/navigation";
import { UserForm } from "./user-form";

export default function UserFormClient(props: any) {
  const router = useRouter();
  return (
    <UserForm
      {...props}
      onSuccess={() => router.push("/users")}
      onCancel={() => router.push("/users")}
    />
  );
} 