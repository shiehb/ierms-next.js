"use client"

import { useActionState } from "react"
import { adminSignup } from "@/app/actions/admin-setup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation" // Import useRouter

export function AdminSignupForm() {
  const initialState = {
    message: "",
    success: false,
    errors: {},
  }
  const [state, formAction] = useActionState(adminSignup, initialState)
  const router = useRouter() // Initialize useRouter

  const handleGoToLogin = () => {
    router.push("/login")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Initial Admin Setup</CardTitle>
        <CardDescription>
          Create your first administrator account. This form will be disabled after successful registration.
        </CardDescription>
      </CardHeader>
      {state.success ? (
        <CardContent className="space-y-4 text-center">
          <p className="text-lg font-semibold text-green-600">{state.message}</p>
          <p className="text-muted-foreground">Your admin account has been successfully created.</p>
          <Button onClick={handleGoToLogin} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      ) : (
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                disabled={state.success}
                aria-invalid={state.errors?.email ? "true" : "false"}
                aria-describedby={state.errors?.email ? "email-error" : undefined}
              />
              {state.errors?.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {state.errors.email.join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter a strong password"
                required
                minLength={8}
                disabled={state.success}
                aria-invalid={state.errors?.password ? "true" : "false"}
                aria-describedby={state.errors?.password ? "password-error" : undefined}
              />
              {state.errors?.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {state.errors.password.join(", ")}
                </p>
              )}
            </div>
            {state.message && (
              <p className={`text-sm ${state.success ? "text-green-500" : "text-red-500"}`}>{state.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={state.success}>
              Register Admin
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
