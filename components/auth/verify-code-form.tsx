"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyResetCode } from "@/app/actions/password-reset"
import { Loader2 } from "lucide-react"

const initialState = {
  message: "",
  success: false,
}

export function VerifyCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get("email") || ""
  const [state, formAction, isPending] = useActionState(verifyResetCode, initialState)

  // Handle successful verification with redirect
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

      <div className="space-y-2">
        <Label htmlFor="email-display">Email Address</Label>
        <Input id="email-display" type="email" value={email} disabled className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          name="code"
          type="text"
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>
    </form>
  )
}
