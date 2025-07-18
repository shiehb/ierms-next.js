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

    const stats = queueManager.getStats()
    const recentActions = queueManager.getActions().slice(-20) // Get last 20 actions

    return NextResponse.json({
      stats,
      recentActions,
      queueSize: queueManager.getQueueSize(),
      isEmpty: queueManager.isQueueEmpty(),
    })
  } catch (error) {
    console.error("Error fetching queue status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
