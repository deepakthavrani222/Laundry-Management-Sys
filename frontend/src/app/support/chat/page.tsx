'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  MessageCircle,
  Send,
  Search,
  Clock,
  CheckCheck,
  User,
  Circle,
  RefreshCw,
  AlertCircle,
  Ticket,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supportApi } from '@/lib/supportApi'
import Link from 'next/link'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    role: string
  }
  message: string
  isInternal: boolean
  timestamp: string
}

interface TicketChat {
  _id: string
  ticketNumber: string
  title: string
  status: string
  priority: string
  raisedBy: {
    _id: string
    name: string
    email: string
  }
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export default function LiveChatPage() {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState<TicketChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketChat | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedTicket?.messages])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get tickets with messages (active conversations)
      const response = await supportApi.getTickets({
        status: 'in_progress',
        limit: 50,
      })
      setTickets(response.data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketDetail = async (ticketId: string) => {
    setLoadingMessages(true)
    try {
      const response = await supportApi.getTicket(ticketId)
      setSelectedTicket(response.data.ticket)
    } catch (err) {
      console.error('Error fetching ticket:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return
    
    setSending(true)
    try {
      await supportApi.addMessage(selectedTicket._id, newMessage, false)
      setNewMessage('')
      // Refresh ticket to get updated messages
      await fetchTicketDetail(selectedTicket._id)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
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
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500'
      case 'in_progress': return 'bg-green-500'
      case 'resolved': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.raisedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mt-16 h-[calc(100vh-6rem)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Conversations</h2>
              <Button onClick={fetchTickets} variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <Button onClick={fetchTickets} size="sm" variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No active conversations</p>
                <p className="text-gray-400 text-xs mt-1">Tickets in progress will appear here</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => fetchTicketDetail(ticket._id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                    selectedTicket?._id === ticket._id ? 'bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{ticket.raisedBy?.name?.charAt(0) || '?'}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(ticket.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 truncate">{ticket.raisedBy?.name || 'Unknown'}</h3>
                        <span className="text-xs text-gray-400">{formatTime(ticket.updatedAt)}</span>
                      </div>
                      <p className="text-xs text-purple-600 font-medium">{ticket.ticketNumber}</p>
                      <p className="text-sm text-gray-500 truncate">{ticket.title}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{tickets.length}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {tickets.reduce((acc, t) => acc + (t.messages?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">Messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : selectedTicket ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{selectedTicket.raisedBy?.name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedTicket.raisedBy?.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Ticket className="w-3 h-3" />
                    {selectedTicket.ticketNumber} • {selectedTicket.title}
                  </p>
                </div>
              </div>
              <Link href={`/support/tickets/${selectedTicket._id}`}>
                <Button variant="outline" size="sm">
                  View Ticket
                </Button>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedTicket.messages?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-gray-400 text-sm">Start the conversation below</p>
                </div>
              ) : (
                selectedTicket.messages?.map((msg) => {
                  const isAgent = msg.sender?.role === 'support_agent' || msg.sender?.role === 'admin'
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isAgent
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        } ${msg.isInternal ? 'border-2 border-dashed border-amber-400' : ''}`}
                      >
                        {msg.isInternal && (
                          <p className={`text-xs mb-1 ${isAgent ? 'text-purple-200' : 'text-amber-600'}`}>
                            Internal Note
                          </p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isAgent ? 'text-purple-200' : 'text-gray-400'}`}>
                          <span className="text-xs">{msg.sender?.name}</span>
                          <span className="text-xs">• {formatTime(msg.timestamp)}</span>
                          {isAgent && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a ticket from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
