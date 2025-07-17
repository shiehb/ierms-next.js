"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { requestPasswordReset } from "@/app/actions/password-reset"
import { Loader2 } from "lucide-react"

const initialState = {
  message: "",
  success: false,
}

export function ForgotPasswordForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

  // Handle successful request with redirect
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

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          required
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Reset Code"
        )}
      </Button>
    </form>
  )
}
