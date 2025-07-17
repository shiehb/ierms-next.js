"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { forcePasswordChange } from "@/app/actions/force-password-change"
import { Loader2 } from "lucide-react"

const initialState = {
  message: "",
  success: false,
}

export function ForcePasswordChangeForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(forcePasswordChange, initialState)

  // Handle successful password change with redirect
  if (state.success && state.redirectTo) {
    router.push(state.redirectTo)
  }

  // Handle redirect to login if session expired
  if (!state.success && state.redirectTo === "/login") {
    router.push(state.redirectTo)
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Enter current password"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          required
          disabled={isPending}
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          required
          disabled={isPending}
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing Password...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  )
}
