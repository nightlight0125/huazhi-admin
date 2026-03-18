import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { walletCallback } from '@/lib/api/wallet'
import { Button } from '@/components/ui/button'

const searchSchema = z.object({
  session_id: z.string().optional(),
})

export const Route = createFileRoute('/wallet/paymentcallback')({
  validateSearch: searchSchema,
  component: WalletPaymentCallbackPage,
})

function WalletPaymentCallbackPage() {
  const { session_id } = Route.useSearch()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!session_id) {
      setStatus('error')
      setMessage('Missing session_id.')
      return
    }

    let cancelled = false

    walletCallback(session_id)
      .then(() => {
        if (cancelled) return
        setStatus('success')
        setMessage(
          'Wallet top-up result has been processed. You can close this window or go back to Wallet.'
        )
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setMessage(
          err instanceof Error ? err.message : 'Wallet payment callback failed.'
        )
      })

    return () => {
      cancelled = true
    }
  }, [session_id])

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
            <Button onClick={() => navigate({ to: '/wallet' })}>
              Go to Wallet
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
            {/* <Button variant='outline' onClick={() => window.close()}>
              Close window
            </Button> */}
            <Button onClick={() => navigate({ to: '/wallet' })}>
              Go to Wallet
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
