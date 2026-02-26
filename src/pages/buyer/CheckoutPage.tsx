import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, ShieldCheck, ArrowLeft, MapPin } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import * as ordersApi from '@/api/orders'
import api from '@/api/client'
import toast from 'react-hot-toast'
import { BANK_OPTIONS, EMI_PLANS, INDIAN_STATES_AND_UTS, UPI_OPTIONS } from '@/constants/formOptions'

export function CheckoutPage() {
  const { items, total, clear } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NET_BANKING' | 'EMI'>('CARD')
  const [upiMethod, setUpiMethod] = useState<(typeof UPI_OPTIONS)[number]>('QR')
  const [emiMonths, setEmiMonths] = useState<number>(6)
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [upiHandle, setUpiHandle] = useState('')
  const [upiPhone, setUpiPhone] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [address, setAddress] = useState({
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    shippingPhone: '',
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const emiPlan = EMI_PLANS.find((p) => p.months === emiMonths) ?? EMI_PLANS[0]
  const payableAmount = paymentMethod === 'EMI'
    ? total() * (1 + emiPlan.interestPercent / 100)
    : total()

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^\d{10}$/.test(address.shippingPhone)) {
      toast.error('Phone number must be 10 digits')
      return
    }
    if (!/^\d{6}$/.test(address.shippingPincode)) {
      toast.error('Pincode must be 6 digits')
      return
    }
    if (paymentMethod === 'NET_BANKING' && !selectedBank) {
      toast.error('Please select a bank for net banking')
      return
    }
    if (paymentMethod === 'UPI' && upiMethod === 'UPI_ID' && !/^[\w.-]+@[\w.-]+$/.test(upiHandle)) {
      toast.error('Please enter a valid UPI ID')
      return
    }
    if (paymentMethod === 'UPI' && upiMethod === 'PHONE' && !/^\d{10}$/.test(upiPhone)) {
      toast.error('UPI phone number must be 10 digits')
      return
    }

    setLoading(true)
    try {
      const order = await ordersApi.placeOrder({
        items: items.map((i) => ({ productUuid: i.product.uuid, quantity: i.quantity })),
        ...address,
      })

      const payRes = await api.post('/payment', {
        orderUuid: order.uuid,
        amount: payableAmount,
        buyerUuid: order.buyerUuid,
        paymentMethod,
        paymentMeta: {
          upiMethod,
          upiHandle,
          upiPhone,
          bankName: selectedBank,
          emiMonths,
          emiInterestPercent: emiPlan.interestPercent,
        },
      })

      clear()
      if (typeof payRes.data === 'string' && payRes.data.includes('FAILED')) {
        toast.error('Payment failed. You can retry from the order page.')
      } else {
        toast.success('Order placed & payment successful! 🎉')
      }
      navigate(`/orders/${order.uuid}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link to="/cart" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: address + payment */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Shipping address */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input value={address.shippingName} onChange={(e) => setAddress({ ...address, shippingName: e.target.value })} className="input" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input value={address.shippingPhone} onChange={(e) => setAddress({ ...address, shippingPhone: e.target.value })} className="input" placeholder="+91 9876543210" required />
                  </div>
                </div>
                <div>
                  <label className="label">Address</label>
                  <input value={address.shippingAddress} onChange={(e) => setAddress({ ...address, shippingAddress: e.target.value })} className="input" placeholder="123 Main Street, Apt 4B" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input value={address.shippingCity} onChange={(e) => setAddress({ ...address, shippingCity: e.target.value })} className="input" placeholder="Mumbai" required />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <select value={address.shippingState} onChange={(e) => setAddress({ ...address, shippingState: e.target.value })} className="input" required>
                      <option value="">Select state/UT</option>
                      {INDIAN_STATES_AND_UTS.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input value={address.shippingPincode} onChange={(e) => setAddress({ ...address, shippingPincode: e.target.value })} className="input" placeholder="400001" maxLength={6} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'CARD' | 'UPI' | 'NET_BANKING' | 'EMI')} className="input" required>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="EMI">EMI</option>
                  </select>
                </div>

                {paymentMethod === 'UPI' && (
                  <>
                    <div>
                      <label className="label">UPI Option</label>
                      <select value={upiMethod} onChange={(e) => setUpiMethod(e.target.value as (typeof UPI_OPTIONS)[number])} className="input" required>
                        {UPI_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    {upiMethod === 'UPI_ID' && (
                      <div>
                        <label className="label">UPI ID</label>
                        <input value={upiHandle} onChange={(e) => setUpiHandle(e.target.value)} className="input" placeholder="name@bank" required />
                      </div>
                    )}
                    {upiMethod === 'PHONE' && (
                      <div>
                        <label className="label">UPI Phone Number</label>
                        <input value={upiPhone} onChange={(e) => setUpiPhone(e.target.value)} className="input" placeholder="9876543210" maxLength={10} required />
                      </div>
                    )}
                  </>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div>
                    <label className="label">Bank</label>
                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="input" required>
                      <option value="">Select bank</option>
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethod === 'EMI' && (
                  <>
                    <div>
                      <label className="label">EMI Tenure</label>
                      <select value={emiMonths} onChange={(e) => setEmiMonths(Number(e.target.value))} className="input" required>
                        {EMI_PLANS.map((plan) => (
                          <option key={plan.months} value={plan.months}>
                            {plan.months} months ({plan.interestPercent}% interest)
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">Total with EMI interest: ₹{payableAmount.toFixed(2)}</p>
                  </>
                )}

                {paymentMethod === 'CARD' && (
                  <>
                <div>
                  <label className="label">Card Number</label>
                  <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="input" placeholder="4242 4242 4242 4242" maxLength={19} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Expiry</label>
                    <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} className="input" placeholder="MM/YY" maxLength={5} required />
                  </div>
                  <div>
                    <label className="label">CVV</label>
                    <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} className="input" placeholder="•••" maxLength={3} type="password" required />
                  </div>
                </div>
                  </>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-1">
                  <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                  <span>This is a demo. No real payment is processed.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: order summary */}
          <div className="card p-6 h-fit">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.uuid} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center text-lg shrink-0">📦</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">×{quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(product.price * quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-lg mb-4">
              <span>Total</span>
              <span>₹{payableAmount.toFixed(2)}</span>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Processing…' : `Pay ₹${payableAmount.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
