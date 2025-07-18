import { FIFOQueue } from "./fifo-queue"
import type { QueueAction, ActionType, QueueStats } from "./types"

class QueueManager {
  private static instance: QueueManager
  private queue: FIFOQueue

  private constructor() {
    this.queue = new FIFOQueue({
      maxQueueSize: 1000,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      maxRetries: 3,
      processingInterval: 1000, // 1 second
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
    })
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager()
    }
    return QueueManager.instance
  }

  // Add action to queue
  addAction(
    userId: number,
    actionType: ActionType,
    data: any,
    options?: { ttl?: number; maxRetries?: number },
  ): string {
    return this.queue.enqueue(userId, actionType, data, options)
  }

  // Get queue statistics
  getStats(): QueueStats {
    return this.queue.getStats()
  }

  // Get all actions
  getActions(status?: QueueAction["status"]): QueueAction[] {
    return this.queue.getActions(status)
  }

  // Get action by ID
  getAction(actionId: string): QueueAction | null {
    return this.queue.getAction(actionId)
  }

  // Get actions for specific user
  getUserActions(userId: number): QueueAction[] {
    return this.queue.getActions().filter((action) => action.userId === userId)
  }

  // Stop queue processing
  stop(): void {
    this.queue.stop()
  }

  // Clear queue (use with caution)
  clear(): void {
    this.queue.clear()
  }

  // Get queue size
  getQueueSize(): number {
    return this.queue.size()
  }

  // Check if queue is empty
  isQueueEmpty(): boolean {
    return this.queue.isEmpty()
  }
}

export const queueManager = QueueManager.getInstance()
