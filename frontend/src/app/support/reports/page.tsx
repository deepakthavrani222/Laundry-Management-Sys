'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { supportApi } from '@/lib/supportApi'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
const STATUS_COLORS = {
  open: '#EF4444',
  in_progress: '#3B82F6',
  overdue: '#F97316',
  resolved: '#10B981',
  escalated: '#F59E0B',
  closed: '#6B7280'
}

export default function SupportReportsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('week')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await supportApi.getDashboard()
      setMetrics(response.data.metrics)
      setCategoryData(response.data.categoryDistribution || [])
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Tickets',
      value: metrics?.totalTickets || 0,
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      description: 'All time'
    },
    {
      name: 'Open Tickets',
      value: metrics?.openTickets || 0,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      description: 'Needs attention'
    },
    {
      name: 'Avg Resolution Time',
      value: `${metrics?.avgResolutionTime || 0}h`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      description: 'Average time to resolve'
    },
    {
      name: 'Resolution Rate',
      value: metrics?.totalTickets > 0 
        ? `${Math.round(((metrics?.totalTickets - metrics?.openTickets - metrics?.inProgressTickets) / metrics?.totalTickets) * 100)}%`
        : '0%',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      description: 'Tickets resolved'
    },
  ]

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Support Reports</h1>
          <p className="text-gray-600">Performance metrics and analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" onClick={fetchReportData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-white/90 mb-1">{stat.name}</div>
            <div className="text-xs text-white/70">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tickets by Category</h2>
          {categoryData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No category data available
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData.map((cat, index) => ({
                    name: cat._id?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Other',
                    count: cat.count,
                    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={75} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Tickets']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tickets by Status</h2>
          {(() => {
            const statusData = [
              { name: 'Open', value: metrics?.openTickets || 0, color: STATUS_COLORS.open },
              { name: 'In Progress', value: metrics?.inProgressTickets || 0, color: STATUS_COLORS.in_progress },
              { name: 'Overdue', value: metrics?.overdueTickets || 0, color: STATUS_COLORS.overdue },
              { name: 'Resolved', value: (metrics?.totalTickets || 0) - (metrics?.openTickets || 0) - (metrics?.inProgressTickets || 0) - (metrics?.overdueTickets || 0), color: STATUS_COLORS.resolved },
            ].filter(item => item.value > 0)
            
            const total = statusData.reduce((sum, item) => sum + item.value, 0)
            
            if (total === 0) {
              return (
                <div className="text-center py-12 text-gray-500">
                  No status data available
                </div>
              )
            }
            
            return (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, 'Tickets']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Today's Performance</h3>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-purple-100">New Tickets</span>
              <span className="font-bold">{metrics?.todayTickets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-100">My Assigned</span>
              <span className="font-bold">{metrics?.myAssignedTickets || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">SLA Compliance</h3>
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-100">On Time</span>
              <span className="font-bold">{(metrics?.totalTickets || 0) - (metrics?.overdueTickets || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Overdue</span>
              <span className="font-bold">{metrics?.overdueTickets || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Resolution Stats</h3>
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-100">Avg Time</span>
              <span className="font-bold">{metrics?.avgResolutionTime || 0}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-100">Total Resolved</span>
              <span className="font-bold">
                {(metrics?.totalTickets || 0) - (metrics?.openTickets || 0) - (metrics?.inProgressTickets || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
