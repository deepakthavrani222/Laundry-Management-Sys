'use client'

import {
  SupportSidebar,
  SupportSidebarProvider,
  useSupportSidebar,
} from '@/components/layout/SupportSidebar'
import SupportHeader from '@/components/layout/SupportHeader'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function SupportLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSupportSidebar()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SupportSidebar />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}
      >
        {/* Header */}
        <SupportHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }

      if (user.role !== 'support_agent') {
        router.push('/auth/login')
        return
      }

      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Support Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <SupportSidebarProvider>
      <SupportLayoutContent>{children}</SupportLayoutContent>
    </SupportSidebarProvider>
  )
}
