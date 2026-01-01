'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Truck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Phone
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import PublicHeader from '@/components/layout/PublicHeader'

interface ServiceItem {
  id: string
  name: string
  basePrice: number
  category: string
  description: string
}

interface PriceItem {
  _id: string
  garment: string
  dryClean: number
  steamPress: number
  starch: number
  washFold: number
  washIron: number
  premiumLaundry: number
}

// FAQ Component
function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full px-8 py-5 text-left flex items-center justify-between transition-colors duration-200 ${
          isOpen 
            ? 'bg-teal-500 hover:bg-teal-500' 
            : 'bg-slate-700 hover:bg-slate-600'
        }`}
      >
        <h4 className="text-base font-medium text-white pr-4">{question}</h4>
        <div className="flex-shrink-0">
          <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 py-6 bg-white border-x border-b border-gray-200">
          <p className="text-gray-600 text-base leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

// Pricing Table Component with Category Tabs
function PricingTable({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [activeCategory, setActiveCategory] = useState('men')
  const [pricingData, setPricingData] = useState<Record<string, PriceItem[]>>({})
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'kids', label: 'Kids' },
    { id: 'household', label: 'Household' },
    { id: 'institutional', label: 'Institutional' },
    { id: 'others', label: 'Others' },
  ]

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/service-items`)
      const data = await response.json()
      console.log('Service items data:', data)
      if (data.success && data.items) {
        // Group items by category and aggregate prices by service
        const grouped: Record<string, Record<string, PriceItem>> = {}
        
        data.items.forEach((item: any) => {
          const cat = item.category
          if (!grouped[cat]) grouped[cat] = {}
          
          const itemName = item.name
          if (!grouped[cat][itemName]) {
            grouped[cat][itemName] = {
              _id: item._id,
              garment: itemName,
              dryClean: 0,
              steamPress: 0,
              starch: 0,
              washFold: 0,
              washIron: 0,
              premiumLaundry: 0
            }
          }
          
          // Set price based on service type
          if (item.service === 'dry_clean' || item.service === 'premium_dry_clean') {
            grouped[cat][itemName].dryClean = item.basePrice
          } else if (item.service === 'steam_press' || item.service === 'premium_steam_press') {
            grouped[cat][itemName].steamPress = item.basePrice
          } else if (item.service === 'starching') {
            grouped[cat][itemName].starch = item.basePrice
          } else if (item.service === 'wash_fold') {
            grouped[cat][itemName].washFold = item.basePrice
          } else if (item.service === 'wash_iron') {
            grouped[cat][itemName].washIron = item.basePrice
          } else if (item.service === 'premium_laundry') {
            grouped[cat][itemName].premiumLaundry = item.basePrice
          }
        })
        
        // Convert to array format
        const result: Record<string, PriceItem[]> = {}
        Object.keys(grouped).forEach(cat => {
          result[cat] = Object.values(grouped[cat])
        })
        
        setPricingData(result)
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      setPricingData({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Pricing</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transparent pricing for all our services. Select a category to view detailed pricing.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category Tabs - Left Side */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Table - Right Side */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 border-b">Garment</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700 border-b">Wash & Fold</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700 border-b">Wash & Iron</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700 border-b">Dry Clean</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700 border-b">Steam Press</th>
              </tr>
            </thead>
            <tbody>
              {pricingData[activeCategory]?.length > 0 ? (
                pricingData[activeCategory].map((item, index) => (
                  <tr 
                    key={item._id || index} 
                    className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="py-4 px-6 text-gray-800">{item.garment}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.washFold > 0 ? `₹${item.washFold}` : '-'}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.washIron > 0 ? `₹${item.washIron}` : '-'}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.dryClean > 0 ? `₹${item.dryClean}` : '-'}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.steamPress > 0 ? `₹${item.steamPress}` : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No items available for this category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Now Button */}
      <div className="text-center mt-8">
        <Link href={isAuthenticated ? "/customer/orders/new" : "/auth/register"}>
          <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-8">
            <Truck className="w-5 h-5 mr-2" />
            Book Service Now
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqData = [
    {
      question: "Do you charge for pickup and delivery?",
      answer: "No, pickup and delivery are completely free for all orders above ₹200. For orders below ₹200, a nominal charge of ₹30 applies."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), UPI payments, credit/debit cards, and digital wallets like Paytm, PhonePe, and Google Pay."
    },
    {
      question: "Is there a minimum order value?",
      answer: "No minimum order value required! Orders above ₹200 qualify for free pickup and delivery."
    },
    {
      question: "Do you offer same-day service?",
      answer: "Yes! Our Express Service provides same-day pickup and delivery. An additional express charge applies."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We offer a 100% satisfaction guarantee. If not satisfied, we'll redo your order for free or provide a full refund."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/pricing.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-teal-900/70"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple & Transparent Pricing
          </h1>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Quality laundry services at affordable prices. No hidden charges.
          </p>
          <Link href="https://wa.me/919876543210" target="_blank">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
              Chat on WhatsApp
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 container mx-auto px-4">
        <PricingTable isAuthenticated={isAuthenticated} />
        
        {/* Disclaimer */}
        <p className="text-center text-lg text-gray-700 font-medium mt-8">
          * Prices may vary based on fabric type and condition. Final price confirmed after inspection.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-2">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Schedule your first pickup today and experience the convenience of professional laundry service.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/customer/orders/new">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  <Truck className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login?redirect=/customer/orders/new">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  <Truck className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="tel:+919876543210">
              <Button size="lg" className="bg-white/20 border-2 border-white text-white hover:bg-white hover:text-teal-600">
                <Phone className="w-5 h-5 mr-2" />
                Call Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
