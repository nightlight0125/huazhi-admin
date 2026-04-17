import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { paymentCallback } from '@/lib/api/orders'
import {
  clearPaymentOrderSource,
  consumePaymentReturnTo,
  peekPaymentOrderSource,
} from '@/lib/payment-return-to'
import { Button } from '@/components/ui/button'

const searchSchema = z.object({
  session_id: z.string().optional(),
  /** 1：Paypal 回调（无 Stripe session_id 占位） */
  payType: z.coerce.number().optional(),
  /** 与 requestPayment / buyProduct returnUrl 一致：决定「前往哪类订单列表」 */
  mode: z.enum(['store', 'sample', 'stock']).optional(),
})

export const Route = createFileRoute('/order/payment-callback')({
  validateSearch: searchSchema,
  component: OrderPaymentCallbackPage,
})

const paymentCallbackOnceBySessionId = new Map<string, Promise<void>>()

function runPaymentCallbackOnce(sessionId: string): Promise<void> {
  const hit = paymentCallbackOnceBySessionId.get(sessionId)
  if (hit) return hit
  const p = paymentCallback(sessionId)
    .then(() => undefined)
    .finally(() => {
      paymentCallbackOnceBySessionId.delete(sessionId)
    })
  paymentCallbackOnceBySessionId.set(sessionId, p)
  return p
}

function orderListButtonTarget(mode: 'store' | 'sample' | 'stock' | undefined) {
  const m = mode ?? 'store'
  if (m === 'sample') {
    return { to: '/sample-orders' as const, label: 'Go to Sample Orders' }
  }
  if (m === 'stock') {
    return { to: '/stock-orders' as const, label: 'Go to Stock Orders' }
  }
  return { to: '/orders' as const, label: 'Go to Store Orders' }
}

function OrderPaymentCallbackPage() {
  const { session_id, payType, mode } = Route.useSearch()
  const navigate = useNavigate()
  const fromStorage = peekPaymentOrderSource()
  const target = orderListButtonTarget(fromStorage ?? mode)

  const goToOrderList = () => {
    clearPaymentOrderSource()
    consumePaymentReturnTo()
    navigate({ to: target.to })
  }

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // Paypal：returnUrl 不含 session_id 占位；仅带 payType=1，由渠道回跳后展示成功
    if (!session_id && payType === 1) {
      setStatus('success')
      setMessage(
        'Payment return received. You can close this window or go back to orders.'
      )
      return
    }

    if (!session_id) {
      setStatus('error')
      setMessage('Missing session_id.')
      return
    }

    let cancelled = false

    runPaymentCallbackOnce(session_id)
      .then(() => {
        if (cancelled) return
        setStatus('success')
        setMessage(
          'Payment result has been processed. You can close this window or go to your orders.'
        )
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setMessage(
          err instanceof Error ? err.message : 'Payment callback failed.'
        )
      })

    return () => {
      cancelled = true
    }
  }, [session_id, payType])

  return (
    <div className='bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-6'>
      {status === 'loading' && (
        <>
          <Loader2 className='text-primary h-10 w-10 animate-spin' />
          <p className='text-muted-foreground text-sm'>
            Processing payment result...
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className='rounded-full bg-green-100 p-4 dark:bg-green-900/30'>
            <svg
              className='h-10 w-10 text-green-600 dark:text-green-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <p className='text-foreground max-w-md text-center font-medium'>
            {message}
          </p>
          <div className='flex gap-3'>
            <Button
              className='bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
              onClick={goToOrderList}
            >
              {target.label}
            </Button>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className='bg-destructive/10 rounded-full p-4'>
            <svg
              className='text-destructive h-10 w-10'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <p className='text-destructive max-w-md text-center font-medium'>
            {message}
          </p>
          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={goToOrderList}
            >
              {target.label}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
