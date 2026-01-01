'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Ticket, 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  MessageCircle,
  Package,
  DollarSign,
  RefreshCw,
  Send,
  XCircle,
  CheckCheck,
  Lock,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { useTicketDetail } from '@/hooks/useSupport'
import { supportApi } from '@/lib/supportApi'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const ticketId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { ticket, loading, error, addMessage, resolve, refetch } = useTicketDetail(ticketId)
  
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [resolutionType, setResolutionType] = useState<'resolved' | 'refund' | 'rewash' | 'compensation'>('resolved')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      await addMessage(newMessage, isInternal)
      setNewMessage('')
      toast.success('Message sent')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Please enter a resolution')
      return
    }
    try {
      let fullResolution = resolution
      if (resolutionType === 'refund') {
        fullResolution = `[REFUND: ₹${refundAmount}] ${resolution}`
      } else if (resolutionType === 'rewash') {
        fullResolution = `[REWASH SCHEDULED] ${resolution}`
      } else if (resolutionType === 'compensation') {
        fullResolution = `[COMPENSATION PROVIDED] ${resolution}`
      }
      
      await resolve(fullResolution)
      setShowResolveModal(false)
      setResolution('')
      toast.success('Ticket resolved successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve ticket')
    }
  }

  const handleTakeTicket = async () => {
    try {
      await supportApi.updateTicketStatus(ticketId, 'in_progress')
      refetch()
      toast.success('Ticket assigned to you')
    } catch (err: any) {
      toast.error(err.message || 'Failed to take ticket')
    }
  }

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      toast.error('Please enter escalation reason')
      return
    }
    try {
      await supportApi.escalateTicket(ticketId, 'admin', escalationReason)
      setShowEscalateModal(false)
      setEscalationReason('')
      refetch()
      toast.success('Ticket escalated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to escalate ticket')
    }
  }

  const handleCreateRefund = async () => {
    if (!refundAmount || !refundReason) {
      toast.error('Please fill all fields')
      return
    }
    try {
      await supportApi.createRefund({
        orderId: ticket?.relatedOrder?._id || '',
        amount: parseFloat(refundAmount),
        reason: refundReason,
        category: ticket?.category || 'other',
        ticketId: ticketId
      })
      setShowRefundModal(false)
      setRefundAmount('')
      setRefundReason('')
      refetch()
      toast.success('Refund request created successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create refund')
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50 border-red-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'escalated': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-amber-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <div className="mt-16 h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="mt-16 p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Ticket</h3>
              <p className="text-red-600">{error || 'Ticket not found'}</p>
            </div>
          </div>
          <Link href="/support/tickets">
            <Button className="mt-4 bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/support/tickets">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-800">{ticket.ticketNumber}</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{ticket.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ticket.status === 'open' && (
              <Button onClick={handleTakeTicket} className="bg-blue-500 hover:bg-blue-600 text-white">
                Take Ticket
              </Button>
            )}
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Ticket Description as first message */}
            <div className="flex justify-start">
              <div className="max-w-[70%]">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{ticket.raisedBy?.name}</span>
                    <span className="text-xs text-gray-400">• {formatTime(ticket.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{ticket.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Category: {ticket.category?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {ticket.messages?.map((msg, index) => {
              const isAgent = msg.sender?.role === 'support_agent' || msg.sender?.role === 'admin'
              const isCurrentUser = msg.sender?._id === user?._id
              
              return (
                <div key={msg._id || index} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.isInternal ? 'opacity-75' : ''}`}>
                    {msg.isInternal && (
                      <div className="flex items-center gap-1 mb-1 justify-end">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span className="text-xs text-amber-600 font-medium">Internal Note</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${
                      isAgent
                        ? msg.isInternal 
                          ? 'bg-amber-100 border-2 border-dashed border-amber-300 text-gray-800'
                          : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <div className={`flex items-center justify-end gap-1 mt-2 ${
                        isAgent && !msg.isInternal ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">{msg.sender?.name}</span>
                        <span className="text-xs">• {formatTime(msg.timestamp)}</span>
                        {isAgent && !msg.isInternal && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Internal note
                  </span>
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={isInternal ? "Add internal note..." : "Type a message..."}
                  disabled={sending}
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isInternal ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                  }`}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Resolved/Closed Banner */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && (
            <div className="p-4 bg-green-50 border-t border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">This ticket has been {ticket.status}</p>
                  {ticket.resolution && (
                    <p className="text-xs text-green-600 mt-0.5">{ticket.resolution}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          {/* Customer Info */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{ticket.raisedBy?.name?.charAt(0) || '?'}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{ticket.raisedBy?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{ticket.raisedBy?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {ticket.raisedBy?.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Related Order */}
          {ticket.relatedOrder && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Order</h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{ticket.relatedOrder.orderNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                    {ticket.relatedOrder.status?.replace('_', ' ')}
                  </span>
                </div>
                <Link href={`/admin/orders/${ticket.relatedOrder._id}`} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  View Order <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Ticket Info */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-800 capitalize">{ticket.category?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-800">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              {ticket.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="text-gray-800">{ticket.assignedTo.name}</span>
                </div>
              )}
              {ticket.sla?.isOverdue && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">SLA Breached</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => setShowResolveModal(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve Ticket
                </Button>
                
                {ticket.relatedOrder && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRefundModal(true)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Issue Refund
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => setShowEscalateModal(true)}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Escalate
                </Button>
              </div>
            </div>
          )}

          {/* Resolution Info */}
          {ticket.resolution && (
            <div className="p-4 bg-green-50">
              <h3 className="text-sm font-semibold text-green-700 mb-2">Resolution</h3>
              <p className="text-sm text-green-600">{ticket.resolution}</p>
              {ticket.resolvedBy && (
                <p className="text-xs text-green-500 mt-2">
                  By {ticket.resolvedBy.name} • {new Date(ticket.resolvedAt || '').toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Resolve Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'resolved', label: 'Resolved', icon: CheckCircle },
                    { id: 'refund', label: 'Refund', icon: DollarSign },
                    { id: 'rewash', label: 'Rewash', icon: RefreshCw },
                    { id: 'compensation', label: 'Compensation', icon: Package },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setResolutionType(type.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        resolutionType === type.id 
                          ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {resolutionType === 'refund' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Refund Amount (₹)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Details *</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleResolve}
                  disabled={!resolution.trim()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowResolveModal(false)
                    setResolution('')
                    setResolutionType('resolved')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Issue Refund</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for refund..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handleCreateRefund}
                  disabled={!refundAmount || !refundReason}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Create Refund
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowRefundModal(false)
                    setRefundAmount('')
                    setRefundReason('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Escalate Ticket</h3>
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-700">
                  This will escalate the ticket to a manager for review.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Escalation *</label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Why does this ticket need escalation?"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleEscalate}
                  disabled={!escalationReason.trim()}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Escalate
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowEscalateModal(false)
                    setEscalationReason('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
