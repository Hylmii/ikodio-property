'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Home, Users, CreditCard, Upload, CheckCircle, Loader2, AlertCircle, Wallet, X } from 'lucide-react'
import Script from 'next/script'

interface BookingData {
  id: string
  bookingNumber: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  paymentDeadline: string
  paymentProof: string | null
  duration: number
  room: {
    id: string
    name: string
    basePrice: number
    images: string[]
    property: {
      id: string
      name: string
      city: string
    }
  }
}

declare global {
  interface Window {
    snap?: any
  }
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingMidtrans, setIsProcessingMidtrans] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-user')
    }
  }, [status, router])

  useEffect(() => {
    fetchBooking()
  }, [resolvedParams.id])

  useEffect(() => {
    if (!booking || !booking.paymentDeadline) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const deadline = new Date(booking.paymentDeadline).getTime()
      const distance = deadline - now

      if (distance < 0) {
        setIsExpired(true)
        setTimeRemaining('Expired')
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      let timeString = ''
      if (days > 0) timeString += `${days}d `
      timeString += `${hours}h ${minutes}m ${seconds}s`
      
      setTimeRemaining(timeString)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [booking])

  async function fetchBooking() {
    try {
      const response = await fetch(`/api/bookings/${resolvedParams.id}`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      const result = await response.json()
      
      // API returns { success: true, data: booking }
      if (result.success && result.data) {
        setBooking(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch booking')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setPaymentProof(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPaymentProof(null)
    setPreviewUrl('')
  }

  async function handleUpload() {
    if (!paymentProof || !booking) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', paymentProof)

      const response = await fetch(`/api/bookings/${booking.id}/payment`, {
        method: 'PUT',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload payment proof')
      }

      alert('Payment proof uploaded successfully! Waiting for confirmation.')
      fetchBooking()
      removePreview()
    } catch (error: any) {
      console.error('Error uploading payment proof:', error)
      alert(error.message || 'Failed to upload payment proof')
    } finally {
      setIsUploading(false)
    }
  }

  async function handlePayWithMidtrans() {
    if (!booking || !window.snap) {
      alert('Midtrans is not loaded yet. Please wait...')
      return
    }

    setIsProcessingMidtrans(true)
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: booking.bookingNumber,
          grossAmount: booking.totalPrice,
          customerDetails: {
            first_name: session?.user?.name || 'Guest',
            email: session?.user?.email || '',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      if (!data.token) {
        throw new Error('No payment token received')
      }

      window.snap.pay(data.token, {
        onSuccess: function(result: any) {
          console.log('Payment success:', result)
          alert('Payment successful!')
          fetchBooking()
          router.push('/transactions')
        },
        onPending: function(result: any) {
          console.log('Payment pending:', result)
          alert('Payment is being processed.')
          fetchBooking()
        },
        onError: function(error: any) {
          console.error('Payment error:', error)
          alert('Payment failed. Please try again.')
        },
        onClose: function() {
          console.log('Payment popup closed')
          setIsProcessingMidtrans(false)
        }
      })
    } catch (error: any) {
      console.error('Error creating payment:', error)
      alert(error.message || 'Failed to initiate payment')
      setIsProcessingMidtrans(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  const canUpload = booking.status === 'WAITING_PAYMENT' && !isExpired

  return (
    <>
      {/* Load Midtrans Snap script */}
      <Script
        src={`https://app.${process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? '' : 'sandbox.'}midtrans.com/snap/snap.js`}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setSnapLoaded(true)}
        strategy="lazyOnload"
      />
      
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          {/* Back Button */}
          <Button
            onClick={() => router.push('/transactions')}
            variant="ghost"
            className="mb-6 hover:bg-white"
          >
            ← Back to Transactions
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Summary</h2>
              <p className="text-slate-500 mb-8">Review your items before payment</p>

              {/* Booking Items */}
              <div className="space-y-4 mb-6">
                {/* Room Item */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Home className="h-8 w-8 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{booking.room.name}</p>
                    <p className="text-sm text-slate-500">{booking.room.property.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{booking.duration} night{booking.duration > 1 ? 's' : ''}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatPrice(booking.room.basePrice)}</p>
                </div>

                {/* Guest Info */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Users className="h-8 w-8 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Guest Details</p>
                    <p className="text-sm text-slate-500">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(booking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (0%)</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="text-green-600">-Rp 0</span>
                </div>
                
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-xl text-slate-900">{formatPrice(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Secure Payment Badge */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Secure Payment</p>
                    <p className="text-xs text-blue-700">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Details</h2>
              <p className="text-slate-500 mb-8">Choose your preferred payment method</p>

              {/* If can upload (waiting payment) */}
              {canUpload ? (
                <>
                  {/* Midtrans Info */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">
                      You will be redirected to Midtrans secure payment page to complete your transaction
                    </p>
                  </div>

                  {/* Available Payment Methods */}
                  <div className="mb-8">
                    <p className="font-semibold text-slate-900 mb-4">Available payment methods through Midtrans:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">Credit Card</span>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2">
                        <Home className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">Bank Transfer</span>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">E-Wallet</span>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">QRIS</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider - OR */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-slate-500 font-medium">or</span>
                    </div>
                  </div>

                  {/* Upload Payment Proof Section */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Upload Payment Proof</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="payment-proof" className="text-sm font-semibold text-slate-900 mb-2 block">
                          Payment Receipt Image
                        </Label>
                        <Input
                          id="payment-proof"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Supported: JPG, PNG, JPEG • Max 5MB
                        </p>
                      </div>

                      {/* Preview */}
                      {previewUrl && (
                        <div className="relative group">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200">
                            <Image
                              src={previewUrl}
                              alt="Payment proof preview"
                              fill
                              className="object-contain bg-slate-50"
                            />
                          </div>
                          <Button
                            onClick={removePreview}
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Upload Button */}
                      <Button
                        onClick={handleUpload}
                        disabled={!paymentProof || isUploading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Payment Proof
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Time Remaining & Email Info */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-900 mb-2 block">Email Address</Label>
                      <Input 
                        type="email" 
                        value={session?.user?.email || ''} 
                        disabled
                        className="bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">Payment confirmation will be sent to this email</p>
                    </div>
                    
                    {/* Time Remaining */}
                    {timeRemaining && !isExpired && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <p className="text-sm text-amber-700">
                            Time remaining: <strong>{timeRemaining}</strong>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pay with Midtrans Button */}
                  <div className="mt-8">
                    <Button
                      onClick={handlePayWithMidtrans}
                      disabled={isProcessingMidtrans || !snapLoaded || isExpired}
                      className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base"
                    >
                      {isProcessingMidtrans ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : !snapLoaded ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Pay {formatPrice(booking.totalPrice)} with Midtrans
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-slate-500 mt-4">
                      Powered by Midtrans - Secure payment gateway
                    </p>
                  </div>
                </>
              ) : (
                /* If expired or already paid */
                <div className="text-center py-12">
                  {isExpired ? (
                    <div>
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-slate-900 font-semibold mb-2">Payment Time Expired</p>
                      <p className="text-slate-600 text-sm">This booking has been cancelled</p>
                    </div>
                  ) : booking.status === 'WAITING_CONFIRMATION' ? (
                    <div>
                      <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-slate-900 font-semibold mb-2">Payment Under Review</p>
                      <p className="text-slate-600 text-sm">We are verifying your payment</p>
                    </div>
                  ) : (
                    <div>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-slate-900 font-semibold mb-2">Booking Confirmed</p>
                      <p className="text-slate-600 text-sm">Your payment has been processed</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
