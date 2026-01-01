'use client'

import { useAuthStore } from '@/store/authStore'
import { useSupportDashboard } from '@/hooks/useSupport'
import { 
  Ticket, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

export default function SupportDashboard() {
  const { user } = useAuthStore()
  const { metrics, recentTickets, categoryDistribution, loading, error, refetch } = useSupportDashboard()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-700 bg-red-100 border border-red-200'
      case 'in_progress': return 'text-blue-700 bg-blue-100 border border-blue-200'
      case 'resolved': return 'text-emerald-700 bg-emerald-100 border border-emerald-200'
      case 'escalated': return 'text-amber-700 bg-amber-100 border border-amber-200'
      default: return 'text-gray-700 bg-gray-100 border border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-600'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 mt-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <Button onClick={refetch} className="mt-4 bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />Retry
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    { name: 'Open Tickets', value: metrics?.openTickets || 0, icon: AlertCircle, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/30', change: 'Needs attention' },
    { name: 'In Progress', value: metrics?.inProgressTickets || 0, icon: Clock, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30', change: 'Being handled' },
    { name: 'My Tickets', value: metrics?.myAssignedTickets || 0, icon: Users, gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/30', change: 'Assigned to you' },
    { name: 'Overdue', value: metrics?.overdueTickets || 0, icon: AlertTriangle, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30', change: 'SLA breached' },
  ]

  return (
    <div className="space-y-6 mt-16 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome, {user?.name}! 👋</h1>
              <p className="text-purple-100">Ready to help customers and resolve their issues today.</p>
              <p className="text-purple-200 text-sm mt-1">
                Total tickets today: {metrics?.todayTickets || 0} | Avg resolution: {metrics?.avgResolutionTime || 0}h
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/support/tickets">
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20">
                <Ticket className="w-5 h-5 mr-2" />View Tickets
              </Button>
            </Link>
            <Button className="bg-white text-purple-600 hover:bg-white/90" onClick={refetch}>
              <RefreshCw className="w-5 h-5 mr-2" />Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-white/90 mb-2">{stat.name}</div>
              <div className="text-xs text-white/70">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">Ticket Status</h2>
            <p className="text-sm text-gray-500">Current distribution</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Open', value: metrics?.openTickets || 0, color: '#ef4444' },
                    { name: 'In Progress', value: metrics?.inProgressTickets || 0, color: '#3b82f6' },
                    { name: 'Resolved', value: metrics?.resolvedTickets || 0, color: '#10b981' },
                    { name: 'Escalated', value: metrics?.escalatedTickets || 0, color: '#f59e0b' },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { color: '#ef4444' },
                    { color: '#3b82f6' },
                    { color: '#10b981' },
                    { color: '#f59e0b' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Open ({metrics?.openTickets || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">In Progress ({metrics?.inProgressTickets || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-600">Resolved ({metrics?.resolvedTickets || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">Escalated ({metrics?.escalatedTickets || 0})</span>
            </div>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">By Category</h2>
            <p className="text-sm text-gray-500">Ticket categories</p>
          </div>
          <div className="h-56">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution.map((cat: any) => {
                  const categoryLabels: Record<string, string> = {
                    'quality': 'Quality',
                    'delay': 'Delay',
                    'missing_item': 'Missing',
                    'damaged': 'Damaged',
                    'payment': 'Payment',
                    'other': 'Other'
                  }
                  return {
                    name: categoryLabels[cat._id] || cat._id?.replace('_', ' ') || 'Other',
                    count: cat.count
                  }
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="url(#supportGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="supportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-800">Recent Tickets</h2>
            <Link href="/support/tickets" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center group">
              View All<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
              <p className="text-gray-600">New tickets will appear here.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {recentTickets.map((ticket: any) => (
                <Link key={ticket._id} href={`/support/tickets/${ticket._id}`}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer border-l-4 ${getPriorityColor(ticket.priority)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Ticket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{ticket.ticketNumber}</div>
                      <div className="text-sm text-gray-600 line-clamp-1">{ticket.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} mb-2`}>
                      {ticket.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{ticket.priority}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/support/tickets" className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Manage Tickets</div>
                  <div className="text-xs text-gray-500">View & resolve tickets</div>
                </div>
              </Link>

              <Link href="/support/tickets?status=open" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 group">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Open Tickets</div>
                  <div className="text-xs text-gray-500">{metrics?.openTickets || 0} awaiting response</div>
                </div>
              </Link>

              <Link href="/support/reports" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Reports</div>
                  <div className="text-xs text-gray-500">View performance metrics</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tickets by Category</h2>
            {categoryDistribution.length === 0 ? (
              <p className="text-gray-500 text-sm">No category data available</p>
            ) : (
              <div className="space-y-3">
                {categoryDistribution.map((cat: any) => (
                  <div key={cat._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 capitalize">{cat._id?.replace('_', ' ') || 'Other'}</span>
                    <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Today's Stats</h3>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Total Tickets</span>
                  <span className="text-lg font-bold">{metrics?.totalTickets || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Today's Tickets</span>
                  <span className="text-lg font-bold">{metrics?.todayTickets || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Avg Resolution</span>
                  <span className="text-lg font-bold">{metrics?.avgResolutionTime || 0}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
