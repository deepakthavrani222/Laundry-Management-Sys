const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

class SupportAPI {
  private getAuthHeaders() {
    let token = null
    
    // First try direct token (set by authStore)
    token = localStorage.getItem('token')
    
    // Fallback: try Zustand persist format
    if (!token) {
      const authData = localStorage.getItem('laundry-auth')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          // Zustand persist stores state inside { state: {...}, version: 0 }
          token = parsed.state?.token || parsed.token
        } catch (e) {
          console.error('Error parsing auth data:', e)
        }
      }
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response received:', text)
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }
    
    return data
  }

  // Dashboard
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/support/dashboard`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Tickets
  async getTickets(params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    category?: string
    assignedTo?: string
    search?: string
    isOverdue?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/support/tickets?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    return this.handleResponse(response)
  }

  async getTicket(ticketId: string) {
    const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async updateTicketStatus(ticketId: string, status: string, priority?: string) {
    const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, priority })
    })
    return this.handleResponse(response)
  }

  async assignTicket(ticketId: string, assignedTo: string) {
    const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/assign`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ assignedTo })
    })
    return this.handleResponse(response)
  }

  async addMessage(ticketId: string, message: string, isInternal: boolean = false) {
    const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, isInternal })
    })
    return this.handleResponse(response)
  }

  async escalateTicket(ticketId: string, escalatedTo: string, reason: string) {
    const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/escalate`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ escalatedTo, reason })
    })
    return this.handleResponse(response)
  }

  async resolveTicket(ticketId: string, resolution: string) {
    const response = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/resolve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ resolution })
    })
    return this.handleResponse(response)
  }

  // Get order details for ticket
  async getOrderDetails(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Create refund from ticket
  async createRefund(data: {
    orderId: string
    amount: number
    reason: string
    category: string
    ticketId?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse(response)
  }

  // Customers
  async getCustomers(params?: {
    page?: number
    limit?: number
    search?: string
    isVIP?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/support/customers?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    return this.handleResponse(response)
  }

  async getCustomer(customerId: string) {
    const response = await fetch(`${API_BASE_URL}/support/customers/${customerId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }
}

export const supportApi = new SupportAPI()
