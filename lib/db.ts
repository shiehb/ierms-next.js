// This is a mock database for demonstration purposes.
// In a real application, you would use a persistent database like Supabase, Neon, etc.
// The state will not persist across different runs of the Next.js environment.

let adminExists = false
let adminCredentials = { email: "", passwordHash: "" }

export const db = {
  checkAdminExists: async (): Promise<boolean> => {
    // Simulate a database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    return adminExists
  },
  createAdmin: async (email: string, passwordHash: string): Promise<void> => {
    // Simulate a database write delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    adminCredentials = { email, passwordHash }
    adminExists = true
    console.log("Admin created:", adminCredentials.email)
  },
  getAdminCredentials: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return adminCredentials
  },
}
