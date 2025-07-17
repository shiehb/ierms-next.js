import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/ui/avatar-upload";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userInitials = `${user.first_name?.[0] || ""}${
    user.last_name?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-medium">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription className="text-medium">
              Upload or change your profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={user.avatar_url}
              userInitials={userInitials}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription className="text-medium">
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  First Name
                </label>
                <p className="mt-1 text-medium">
                  {user.first_name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Name
                </label>
                <p className="mt-1 text-medium">
                  {user.last_name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Middle Name
                </label>
                <p className="mt-1 text-medium">
                  {user.middle_name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="mt-1 text-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User Level
                </label>
                <div className="mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {user.user_level}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </label>
                <div className="mt-1">
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="mt-1 text-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="mt-1 text-medium">
                  {new Date(user.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
