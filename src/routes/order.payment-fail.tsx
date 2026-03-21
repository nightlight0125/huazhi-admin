import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/order/payment-fail')({
  component: OrderPaymentFailPage,
})

function OrderPaymentFailPage() {
  const navigate = useNavigate()

  return (
    <div className='bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-6'>
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
      <p className='text-destructive text-center font-medium'>
        Payment was cancelled or failed. You can try again or go back to Stock
        Orders.
      </p>
      <Button onClick={() => navigate({ to: '/stock-orders' })}>
        Go to Stock Orders
      </Button>
    </div>
  )
}
