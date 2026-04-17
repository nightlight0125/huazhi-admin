import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  clearPaymentOrderSource,
  peekPaymentOrderSource,
} from '@/lib/payment-return-to'

const searchSchema = z.object({
  /** 支付来源：店铺订单 / 样品订单 / 备货订单 → 只展示对应的一个入口按钮 */
  mode: z.enum(['store', 'sample', 'stock']).optional(),
  /** 保留兼容旧链接，不参与展示逻辑 */
  payMethod: z.enum(['wallet', 'card']).optional(),
})

export const Route = createFileRoute('/order/payment-success')({
  validateSearch: searchSchema,
  component: OrderPaymentSuccessPage,
})

function orderListTargetFromMode(mode: 'store' | 'sample' | 'stock') {
  if (mode === 'sample') {
    return { to: '/sample-orders' as const, label: 'Go to Sample Orders' }
  }
  if (mode === 'stock') {
    return { to: '/stock-orders' as const, label: 'Go to Stock Orders' }
  }
  return { to: '/orders' as const, label: 'Go to Store Orders' }
}

function OrderPaymentSuccessPage() {
  const { mode } = Route.useSearch()
  const navigate = useNavigate()
  const fromStorage = peekPaymentOrderSource()
  const target = orderListTargetFromMode(fromStorage ?? mode ?? 'store')

  return (
    <div className='bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-6'>
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
        Payment completed successfully. Thank you for your order.
      </p>
      <Button
        className='bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
        onClick={() => {
          clearPaymentOrderSource()
          navigate({ to: target.to })
        }}
      >
        {target.label}
      </Button>
    </div>
  )
}
