'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Package,
  Star,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Ticket,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { supportApi } from '@/lib/supportApi'
import Link from 'next/link'

const ITEMS_PER_PAGE = 8

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  isVIP: boolean
  totalOrders: number
  totalSpent: number
  lastOrderDate: string | null
  createdAt: string
  addresses: Array<{
    street: string
    city: string
    state: string
    pincode: string
  }>
}

interface CustomerDetail extends Customer {
  recentOrders: Array<{
    _id: string
    orderNumber: string
    status: string
    pricing?: { total: number }
    totalAmount?: number
    createdAt: string
  }>
  tickets: Array<{
    _id: string
    ticketNumber: string
    title: string
    status: string
    priority: string
    createdAt: string
  }>
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [showVIPOnly, setShowVIPOnly] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [page, showVIPOnly])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setPage(1)
        fetchCustomers()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await supportApi.getCustomers({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        isVIP: showVIPOnly ? 'true' : undefined,
      })
      const data = response.data.data || []
      setCustomers(data)
      // Map backend pagination keys to frontend format
      const backendPagination = response.data.pagination || {}
      setTotalPages(backendPagination.totalPages || backendPagination.pages || 1)
      // Use data.length as fallback if pagination total is not available
      setTotalCustomers(backendPagination.totalItems ?? backendPagination.total ?? data.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fetchCustomerDetail = async (customerId: string) => {
    setLoadingDetail(true)
    try {
      const response = await supportApi.getCustomer(customerId)
      setSelectedCustomer({
        ...response.data.customer,
        recentOrders: response.data.recentOrders || [],
        tickets: response.data.tickets || [],
      })
    } catch (err) {
      console.error('Error fetching customer detail:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCustomerClick = (customer: Customer) => {
    fetchCustomerDetail(customer._id)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-700 bg-green-100'
      case 'processing': return 'text-blue-700 bg-blue-100'
      case 'pending': return 'text-amber-700 bg-amber-100'
      case 'cancelled': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6 mt-16 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500">View and manage customer information</p>
        </div>
        <Button onClick={fetchCustomers} variant="outline" className="bg-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button 
            variant={showVIPOnly ? "default" : "outline"} 
            onClick={() => setShowVIPOnly(!showVIPOnly)}
            className={showVIPOnly ? "bg-amber-500 hover:bg-amber-600" : "border-gray-200"}
          >
            <Crown className="w-4 h-4 mr-2" />
            VIP Only
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchCustomers} size="sm" variant="outline" className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-800">All Customers ({totalCustomers})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">No customers found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {customers.map((customer) => (
                <div
                  key={customer._id}
                  onClick={() => handleCustomerClick(customer)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedCustomer?._id === customer._id ? 'bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">{customer.name?.charAt(0) || '?'}</span>
                      </div>
                      {customer.isVIP && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                        {customer.isVIP && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">VIP</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{customer.totalOrders} orders</p>
                      <p className="text-sm text-gray-500">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCustomers > ITEMS_PER_PAGE && (
            <Pagination
              current={page}
              pages={totalPages}
              total={totalCustomers}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              itemName="customers"
            />
          )}
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingDetail ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading details...</p>
            </div>
          ) : selectedCustomer ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{selectedCustomer.name?.charAt(0) || '?'}</span>
                    </div>
                    {selectedCustomer.isVIP && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedCustomer.name}</h2>
                    {selectedCustomer.isVIP && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">VIP Customer</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact</h3>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.addresses?.[0] && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm">
                        {selectedCustomer.addresses[0].street}, {selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} - {selectedCustomer.addresses[0].pincode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-xs">Total Orders</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="text-xs">Total Spent</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Order</span>
                    <span className="text-gray-800">{formatDate(selectedCustomer.lastOrderDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Customer Since</span>
                    <span className="text-gray-800">{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>

                {/* Recent Orders */}
                {selectedCustomer.recentOrders?.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Orders</h3>
                    <div className="space-y-2">
                      {selectedCustomer.recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-sm font-medium text-gray-800 mt-1">{formatCurrency(order.pricing?.total || order.totalAmount || 0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tickets */}
                {selectedCustomer.tickets?.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Support Tickets</h3>
                    <div className="space-y-2">
                      {selectedCustomer.tickets.map((ticket) => (
                        <Link 
                          key={ticket._id} 
                          href={`/support/tickets/${ticket._id}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{ticket.ticketNumber}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{ticket.title}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            ticket.status === 'open' ? 'text-red-700 bg-red-100' :
                            ticket.status === 'resolved' ? 'text-green-700 bg-green-100' :
                            'text-blue-700 bg-blue-100'
                          }`}>
                            {ticket.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Select a customer</h3>
              <p className="text-gray-500 text-sm">Click on a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
