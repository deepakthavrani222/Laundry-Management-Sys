'use client'

import { useState, useEffect, useCallback } from 'react'
import { supportApi } from '@/lib/supportApi'

export interface DashboardMetrics {
  totalTickets: number
  todayTickets: number
  openTickets: number
  inProgressTickets: number
  overdueTickets: number
  myAssignedTickets: number
  avgResolutionTime: number
}

export interface Ticket {
  _id: string
  ticketNumber: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  raisedBy: {
    _id: string
    name: string
    email: string
    phone: string
  }
  assignedTo?: {
    _id: string
    name: string
    email?: string
  }
  relatedOrder?: {
    _id: string
    orderNumber: string
    status: string
  }
  resolution?: string
  resolvedBy?: { _id: string; name: string }
  resolvedAt?: string
  escalatedTo?: { _id: string; name: string }
  escalationReason?: string
  sla: {
    isOverdue: boolean
    responseTime?: number
    resolutionTime?: number
  }
  messages: Array<{
    _id: string
    sender: { _id: string; name: string; role: string }
    message: string
    isInternal: boolean
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

export function useSupportDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [categoryDistribution, setCategoryDistribution] = useState<Array<{_id: string, count: number}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await supportApi.getDashboard()
      setMetrics(response.data.metrics)
      setRecentTickets(response.data.recentTickets || [])
      setCategoryDistribution(response.data.categoryDistribution || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    metrics,
    recentTickets,
    categoryDistribution,
    loading,
    error,
    refetch: fetchDashboard
  }
}

export function useSupportTickets(filters?: {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  search?: string
  isOverdue?: boolean
}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await supportApi.getTickets(filters)
      setTickets(response.data.data || [])
      // Map backend pagination keys to frontend format
      const backendPagination = response.data.pagination || {}
      setPagination({
        current: backendPagination.currentPage || 1,
        pages: backendPagination.totalPages || 1,
        total: backendPagination.totalItems || 0,
        limit: backendPagination.itemsPerPage || 20
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  const takeTicket = async (ticketId: string) => {
    try {
      await supportApi.updateTicketStatus(ticketId, 'in_progress')
      await fetchTickets()
      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to take ticket')
    }
  }

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await supportApi.updateTicketStatus(ticketId, status)
      await fetchTickets()
      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const resolveTicket = async (ticketId: string, resolution: string) => {
    try {
      await supportApi.resolveTicket(ticketId, resolution)
      await fetchTickets()
      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to resolve ticket')
    }
  }

  const escalateTicket = async (ticketId: string, escalatedTo: string, reason: string) => {
    try {
      await supportApi.escalateTicket(ticketId, escalatedTo, reason)
      await fetchTickets()
      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to escalate ticket')
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return {
    tickets,
    pagination,
    loading,
    error,
    takeTicket,
    updateStatus,
    resolveTicket,
    escalateTicket,
    refetch: fetchTickets
  }
}

export function useTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      setError(null)
      const response = await supportApi.getTicket(ticketId)
      setTicket(response.data.ticket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  const addMessage = async (message: string, isInternal: boolean = false) => {
    if (!ticketId) return
    try {
      await supportApi.addMessage(ticketId, message, isInternal)
      await fetchTicket()
      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add message')
    }
  }

  const resolve = async (resolution: string) => {
    if (!ticketId) return
    try {
      await supportApi.resolveTicket(ticketId, resolution)
      await fetchTicket()
      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to resolve ticket')
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  return {
    ticket,
    loading,
    error,
    addMessage,
    resolve,
    refetch: fetchTicket
  }
}
