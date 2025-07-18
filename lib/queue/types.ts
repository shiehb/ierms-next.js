export type ActionType = "CREATE_USER" | "UPDATE_USER" | "RESET_PASSWORD" | "UPLOAD_AVATAR" | "DELETE_AVATAR"

export type ActionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "RETRYING"

export interface QueueAction {
  id: string
  userId: number
  actionType: ActionType
  data: any
  status: ActionStatus
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
  retryCount: number
  maxRetries: number
  ttl: number // Time to live in milliseconds
  error?: string
}

export interface QueueStats {
  totalActions: number
  pendingActions: number
  processingActions: number
  completedActions: number
  failedActions: number
  retryingActions: number
}

export interface QueueConfig {
  maxQueueSize: number
  defaultTTL: number // in milliseconds
  maxRetries: number
  processingInterval: number // in milliseconds
  cleanupInterval: number // in milliseconds
}
