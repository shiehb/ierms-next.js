"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Activity, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface QueueStats {
  totalActions: number
  pendingActions: number
  processingActions: number
  completedActions: number
  failedActions: number
  retryingActions: number
}

interface QueueAction {
  id: string
  userId: number
  actionType: string
  status: string
  createdAt: string
  processedAt?: string
  completedAt?: string
  retryCount: number
  maxRetries: number
  error?: string
}

interface QueueStatus {
  stats: QueueStats
  recentActions: QueueAction[]
  queueSize: number
  isEmpty: boolean
}

export default function QueueManagementPage() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [allActions, setAllActions] = useState<QueueAction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchQueueStatus = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/queue/status")
      if (response.ok) {
        const data = await response.json()
        setQueueStatus(data)
      }
    } catch (error) {
      console.error("Error fetching queue status:", error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const fetchAllActions = async () => {
    try {
      const response = await fetch("/api/queue/actions")
      if (response.ok) {
        const data = await response.json()
        setAllActions(data.actions)
      }
    } catch (error) {
      console.error("Error fetching queue actions:", error)
    }
  }

  useEffect(() => {
    fetchQueueStatus()
    fetchAllActions()

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchQueueStatus()
      fetchAllActions()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "PROCESSING":
        return (
          <Badge variant="default">
            <Activity className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case "RETRYING":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Retrying
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading queue status...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">Monitor and manage user operation queue</p>
        </div>
        <Button onClick={fetchQueueStatus} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {queueStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStatus.stats.totalActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{queueStatus.stats.pendingActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{queueStatus.stats.processingActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{queueStatus.stats.completedActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{queueStatus.stats.failedActions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStatus.queueSize}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Actions</TabsTrigger>
          <TabsTrigger value="all">All Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>Last 20 actions processed by the queue</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Retries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueStatus?.recentActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-mono text-sm">{action.id.substring(0, 8)}...</TableCell>
                      <TableCell>{action.userId}</TableCell>
                      <TableCell>{action.actionType}</TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell>{formatDate(action.createdAt)}</TableCell>
                      <TableCell>
                        {action.retryCount}/{action.maxRetries}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Actions</CardTitle>
              <CardDescription>Complete history of queue actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-mono text-sm">{action.id.substring(0, 8)}...</TableCell>
                      <TableCell>{action.userId}</TableCell>
                      <TableCell>{action.actionType}</TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell>{formatDate(action.createdAt)}</TableCell>
                      <TableCell>{action.completedAt ? formatDate(action.completedAt) : "-"}</TableCell>
                      <TableCell>
                        {action.retryCount}/{action.maxRetries}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={action.error}>
                        {action.error || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
