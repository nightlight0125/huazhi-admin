import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { paymentCallback } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'

const searchSchema = z.object({
  session_id: z.string().optional(),
  /** 1：Paypal 回调（无 Stripe session_id 占位） */
  payType: z.coerce.number().optional(),
})

export const Route = createFileRoute('/order/payment-callback')({
  validateSearch: searchSchema,
  component: OrderPaymentCallbackPage,
})

function OrderPaymentCallbackPage() {
  const { session_id, payType } = Route.useSearch()
  const navigate = useNavigate()
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

    paymentCallback(session_id)
      .then(() => {
        if (cancelled) return
        setStatus('success')
        setMessage(
          'Payment result has been processed. You can close this window or go back to Stock Orders.'
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
          <p className='text-foreground text-center font-medium'>{message}</p>
          <div className='flex gap-3'>
            {/* <Button variant='outline' onClick={() => window.close()}>
              Close window
            </Button> */}
            <Button onClick={() => navigate({ to: '/stock-orders' })}>
              Go to Stock Orders
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
          <p className='text-destructive text-center font-medium'>{message}</p>
          <div className='flex gap-3'>
            {/* <Button
              variant='outline'
              onClick={() => window.close()}
            >
              Close window
            </Button> */}
            <Button onClick={() => navigate({ to: '/stock-orders' })}>
              Go to Stock Orders
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
