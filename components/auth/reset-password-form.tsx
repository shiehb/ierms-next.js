"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/app/actions/password-reset"
import { Loader2 } from "lucide-react"

const initialState = {
  message: "",
  success: false,
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get("email") || ""
  const code = searchParams?.get("code") || ""
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  // Handle successful reset with redirect
  if (state.success && state.redirectTo) {
    router.push(state.redirectTo)
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="code" value={code} />

      <div className="space-y-2">
        <Label htmlFor="email-display">Email Address</Label>
        <Input id="email-display" type="email" value={email} disabled className="bg-gray-50" />
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
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
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  )
}
