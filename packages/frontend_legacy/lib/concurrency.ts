import { prisma } from "./prisma"

// Lock timeout for ticket reservations (5 minutes)
const LOCK_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

interface TicketLock {
  showId: string
  userId: string
  quantity: number
  expiresAt: number
}

// In-memory store for active locks (in production, use Redis)
const activeLocks = new Map<string, TicketLock>()

export async function acquireTicketLock(
  showId: string,
  userId: string,
  quantity: number
): Promise<boolean> {
  const lockKey = `${showId}-${userId}`
  const now = Date.now()
  const expiresAt = now + LOCK_TIMEOUT

  // Check if user already has an active lock for this show
  const existingLock = activeLocks.get(lockKey)
  if (existingLock && existingLock.expiresAt > now) {
    return false // User already has an active lock
  }

  // Check if there are enough available tickets
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: { ticketInventory: true }
  })

  if (!show || (show.ticketInventory?.available || 0) < quantity) {
    return false
  }

  // Create lock
  const lock: TicketLock = {
    showId,
    userId,
    quantity,
    expiresAt
  }

  activeLocks.set(lockKey, lock)

  // Clean up expired locks
  cleanupExpiredLocks()

  return true
}

export async function releaseTicketLock(
  showId: string,
  userId: string
): Promise<void> {
  const lockKey = `${showId}-${userId}`
  activeLocks.delete(lockKey)
}

function cleanupExpiredLocks(): void {
  const now = Date.now()
  for (const [key, lock] of activeLocks.entries()) {
    if (lock.expiresAt <= now) {
      activeLocks.delete(key)
    }
  }
}

// Retry mechanism for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  if (lastError) {
    throw lastError
  } else {
    throw new Error('Operation failed after retries')
  }
}

// Validate booking constraints
export function validateBookingConstraints(
  show: any,
  quantity: number,
  existingBookings: any[]
): { valid: boolean; error?: string } {
  // Check if show is in the future
  if (new Date(show.date) <= new Date()) {
    return { valid: false, error: "Cannot book past shows" }
  }

  // Check if user has already booked this show
  const userBookings = existingBookings.filter(b => b.status === 'CONFIRMED')
  if (userBookings.length > 0) {
    return { valid: false, error: "You have already booked this show" }
  }

  // Check maximum tickets per user (e.g., 10 tickets per show)
  const totalUserTickets = userBookings.reduce((sum, b) => sum + b.quantity, 0)
  if (totalUserTickets + quantity > 10) {
    return { valid: false, error: "Maximum 10 tickets per show per user" }
  }

  // Check if show is about to start (within 1 hour)
  const showStartTime = new Date(show.date).getTime()
  const oneHourFromNow = Date.now() + (60 * 60 * 1000)
  if (showStartTime < oneHourFromNow) {
    return { valid: false, error: "Booking closes 1 hour before show time" }
  }

  return { valid: true }
}
