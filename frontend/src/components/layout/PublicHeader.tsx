'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Truck, ChevronDown, ShoppingBag, MapPin, User, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function PublicHeader() {
  const { user, isAuthenticated } = useAuthStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">LaundryPro</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`${isActive('/') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className={`${isActive('/services') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 transition-colors`}
            >
              Services
            </Link>
            <Link 
              href="/pricing" 
              className={`${isActive('/pricing') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 transition-colors`}
            >
              Pricing
            </Link>
            <Link 
              href="/help" 
              className={`${isActive('/help') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 transition-colors`}
            >
              Help
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Button */}
                <Link href="/customer/dashboard">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-teal-500 py-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/customer/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link href="/customer/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <ShoppingBag className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>
                      <Link href="/customer/addresses" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <MapPin className="w-4 h-4 mr-3" />
                        Addresses
                      </Link>
                      <Link href="/customer/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={() => {
                          useAuthStore.getState().logout()
                          window.location.href = '/'
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t mt-4 pt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className={`${isActive('/') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/services" 
                className={`${isActive('/services') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/pricing" 
                className={`${isActive('/pricing') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/help" 
                className={`${isActive('/help') ? 'text-teal-500 font-medium' : 'text-gray-600'} hover:text-teal-500 py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </Link>
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <Link 
                    href="/customer/dashboard" 
                    className="text-gray-600 hover:text-teal-500 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/customer/orders" 
                    className="text-gray-600 hover:text-teal-500 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    href="/customer/addresses" 
                    className="text-gray-600 hover:text-teal-500 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Addresses
                  </Link>
                  <Link 
                    href="/customer/profile" 
                    className="text-gray-600 hover:text-teal-500 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      useAuthStore.getState().logout()
                      setMobileMenuOpen(false)
                      window.location.href = '/'
                    }}
                    className="text-left text-red-600 hover:text-red-700 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-teal-500 text-teal-500 hover:bg-teal-50">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
