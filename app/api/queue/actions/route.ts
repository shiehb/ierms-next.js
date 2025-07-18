import { type NextRequest, NextResponse } from "next/server"
import { queueManager } from "@/lib/queue/queue-manager"
import { getCurrentUser } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const user = await getCurrentUser()
    if (!user || user.user_level !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as any
    const userId = searchParams.get("userId")

    let actions = queueManager.getActions(status)

    if (userId) {
      const userIdNum = Number.parseInt(userId)
      if (!isNaN(userIdNum)) {
        actions = actions.filter((action) => action.userId === userIdNum)
      }
    }

    return NextResponse.json({ actions })
  } catch (error) {
    console.error("Error fetching queue actions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
