import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export { razorpay }

// Platform fee calculation based on ticket price
export function calculatePlatformFee(ticketPrice: number): number {
  if (ticketPrice < 200) {
    return ticketPrice * 0.05 // 5%
  } else if (ticketPrice <= 400) {
    return ticketPrice * 0.07 // 7%
  } else {
    return ticketPrice * 0.08 // 8%
  }
}

// Create Razorpay order
export async function createRazorpayOrder(
  amount: number,
  showId: string,
  userId: string,
  quantity: number
) {
  const platformFee = calculatePlatformFee(amount / quantity)
  const totalAmount = amount * 100 // Convert to paise

  try {
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `${showId}-${userId}-${Date.now()}`,
      notes: {
        showId,
        userId,
        quantity,
        ticketPrice: amount / quantity,
        platformFee
      }
    })

    return order
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    throw new Error('Failed to create payment order')
  }
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  body: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

// Verify Razorpay payment
export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  const body = razorpayOrderId + '|' + razorpayPaymentId

  try {
    return verifyRazorpaySignature(body, razorpaySignature)
  } catch (error) {
    console.error('Payment verification failed:', error)
    return false
  }
}
