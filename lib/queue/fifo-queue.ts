import type { QueueAction, ActionStatus, QueueStats, QueueConfig } from "./types"
import { v4 as uuidv4 } from "uuid"

export class FIFOQueue {
  private queue: QueueAction[] = []
  private processing: Map<string, QueueAction> = new Map()
  private completed: QueueAction[] = []
  private failed: QueueAction[] = []
  private config: QueueConfig
  private processingInterval?: NodeJS.Timeout
  private cleanupInterval?: NodeJS.Timeout
  private isProcessing = false

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxQueueSize: config.maxQueueSize || 1000,
      defaultTTL: config.defaultTTL || 30 * 60 * 1000, // 30 minutes
      maxRetries: config.maxRetries || 3,
      processingInterval: config.processingInterval || 1000, // 1 second
      cleanupInterval: config.cleanupInterval || 5 * 60 * 1000, // 5 minutes
    }

    this.startProcessing()
    this.startCleanup()
  }

  // Add action to queue
  enqueue(
    userId: number,
    actionType: QueueAction["actionType"],
    data: any,
    options: { ttl?: number; maxRetries?: number } = {},
  ): string {
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error("Queue is full. Cannot add more actions.")
    }

    const action: QueueAction = {
      id: uuidv4(),
      userId,
      actionType,
      data,
      status: "PENDING",
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      ttl: options.ttl || this.config.defaultTTL,
    }

    this.queue.push(action)
    console.log(`Action ${action.id} (${actionType}) added to queue for user ${userId}`)
    return action.id
  }

  // Get next action to process
  dequeue(): QueueAction | null {
    if (this.queue.length === 0) {
      return null
    }

    const action = this.queue.shift()!
    action.status = "PROCESSING"
    action.processedAt = new Date()
    this.processing.set(action.id, action)

    return action
  }

  // Mark action as completed
  markCompleted(actionId: string): void {
    const action = this.processing.get(actionId)
    if (action) {
      action.status = "COMPLETED"
      action.completedAt = new Date()
      this.processing.delete(actionId)
      this.completed.push(action)
      console.log(`Action ${actionId} completed successfully`)
    }
  }

  // Mark action as failed
  markFailed(actionId: string, error: string): void {
    const action = this.processing.get(actionId)
    if (action) {
      action.error = error
      action.retryCount++

      if (action.retryCount < action.maxRetries) {
        // Retry the action
        action.status = "RETRYING"
        this.processing.delete(actionId)
        // Add back to queue with delay
        setTimeout(() => {
          action.status = "PENDING"
          this.queue.unshift(action) // Add to front for immediate retry
        }, 1000 * action.retryCount) // Exponential backoff
        console.log(`Action ${actionId} failed, retrying (${action.retryCount}/${action.maxRetries})`)
      } else {
        // Max retries reached
        action.status = "FAILED"
        action.completedAt = new Date()
        this.processing.delete(actionId)
        this.failed.push(action)
        console.error(`Action ${actionId} failed permanently: ${error}`)
      }
    }
  }

  // Get queue statistics
  getStats(): QueueStats {
    return {
      totalActions: this.queue.length + this.processing.size + this.completed.length + this.failed.length,
      pendingActions: this.queue.filter((a) => a.status === "PENDING").length,
      processingActions: this.processing.size,
      completedActions: this.completed.length,
      failedActions: this.failed.length,
      retryingActions: this.queue.filter((a) => a.status === "RETRYING").length,
    }
  }

  // Get all actions with optional filtering
  getActions(status?: ActionStatus): QueueAction[] {
    const allActions = [...this.queue, ...Array.from(this.processing.values()), ...this.completed, ...this.failed]

    if (status) {
      return allActions.filter((action) => action.status === status)
    }

    return allActions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  // Get action by ID
  getAction(actionId: string): QueueAction | null {
    const allActions = this.getActions()
    return allActions.find((action) => action.id === actionId) || null
  }

  // Clear expired actions
  private cleanup(): void {
    const now = Date.now()

    // Remove expired actions from queue
    this.queue = this.queue.filter((action) => {
      const isExpired = now - action.createdAt.getTime() > action.ttl
      if (isExpired) {
        console.log(`Action ${action.id} expired and removed from queue`)
      }
      return !isExpired
    })

    // Remove old completed actions (keep last 100)
    if (this.completed.length > 100) {
      this.completed = this.completed.slice(-100)
    }

    // Remove old failed actions (keep last 100)
    if (this.failed.length > 100) {
      this.failed = this.failed.slice(-100)
    }
  }

  // Start processing loop
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      if (!this.isProcessing && this.queue.length > 0) {
        this.processNext()
      }
    }, this.config.processingInterval)
  }

  // Start cleanup loop
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // Process next action in queue
  private async processNext(): Promise<void> {
    if (this.isProcessing) return

    const action = this.dequeue()
    if (!action) return

    this.isProcessing = true

    try {
      await this.executeAction(action)
      this.markCompleted(action.id)
    } catch (error) {
      this.markFailed(action.id, error instanceof Error ? error.message : "Unknown error")
    } finally {
      this.isProcessing = false
    }
  }

  // Execute the actual action
  private async executeAction(action: QueueAction): Promise<void> {
    console.log(`Processing action ${action.id} (${action.actionType}) for user ${action.userId}`)

    // Import the queue processor to avoid circular dependencies
    const { QueueProcessor } = await import("./queue-processor")
    const processor = new QueueProcessor()

    await processor.processAction(action)
  }

  // Stop the queue processing
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }

  // Get queue size
  size(): number {
    return this.queue.length
  }

  // Check if queue is empty
  isEmpty(): boolean {
    return this.queue.length === 0
  }

  // Clear all actions (use with caution)
  clear(): void {
    this.queue = []
    this.processing.clear()
    this.completed = []
    this.failed = []
  }
}
