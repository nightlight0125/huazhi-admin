import { useEffect, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import { Coins, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  getCustomerBalance,
  requestPayment,
  walletPayment,
} from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export type PaymentMethod = 'balance' | 'credit_card' | 'airwallex'

export interface OrderPayable {
  id: string
  getTotalAmount: () => number
}

interface OrderPayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderPayable | null
  orderType?: number // 订单类型：1=样品订单，2=库存订单，默认为2
  onConfirm?: (
    orderId: string,
    paymentMethod: PaymentMethod,
    amount: number
  ) => void
  onPaymentSuccess?: () => void // 支付成功后的回调，用于刷新数据
}

export function OrderPayDialog({
  open,
  onOpenChange,
  order,
  orderType = 2, // 默认为库存订单
  onConfirm,
  onPaymentSuccess,
}: OrderPayDialogProps) {
  const { auth } = useAuthStore()
  const location = useLocation()
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('balance')
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const [availableBalance, setAvailableBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // 弹框打开时请求客户余额（必须在所有条件 return 之前调用，保证 hooks 数量一致）
  useEffect(() => {
    if (!open || !auth.user?.customerId) return
    let cancelled = false
    setIsLoadingBalance(true)
    getCustomerBalance({ customerId: String(auth.user.customerId) })
      .then((res) => {
        if (cancelled) return
        const data = res.data
        const toNum = (v: unknown) => {
          const n = typeof v === 'number' ? v : parseFloat(String(v ?? 0))
          return Number.isNaN(n) ? 0 : n
        }
        setBalance(toNum(data?.balance))
        setAvailableBalance(toNum(data?.avaliableBalance))
      })
      .catch(() => {
        if (!cancelled) {
          setBalance(0)
          setAvailableBalance(0)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBalance(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, auth.user?.customerId])

  if (!order) return null

  const credits = 0

  const rawTotalAmount = order.getTotalAmount()
  const totalAmount =
    typeof rawTotalAmount === 'number' && !Number.isNaN(rawTotalAmount)
      ? rawTotalAmount
      : 0

  const numberOfOrders = 1

  // 根据当前菜单路由决定支付 type：/orders -> 0 销售，/sample-orders -> 1 样品，/stock-orders -> 2 备货
  const pathname = location.pathname ?? ''
  const paymentType = pathname.includes('sample-orders')
    ? 1
    : pathname.includes('stock-orders')
      ? 2
      : 0

  const handleConfirm = async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    // 如果有自定义的 onConfirm 回调，先调用它
    if (onConfirm) {
      onConfirm(order.id, selectedPaymentMethod, totalAmount)
      onOpenChange(false)
      return
    }

    setIsLoading(true)
    try {
      if (selectedPaymentMethod === 'balance') {
        await walletPayment({
          customerId: String(customerId),
          orderIds: [order.id],
          type: paymentType,
        })
        toast.success('Wallet payment submitted successfully')
      } else {
        const response = await requestPayment({
          customerId: String(customerId),
          orderIds: [order.id],
          type: orderType,
        })
        const paymentUrl =
          typeof response.data === 'string' ? response.data : undefined
        if (paymentUrl && paymentUrl.startsWith('http')) {
          window.open(paymentUrl, '_blank', 'noopener,noreferrer')
          toast.success('Redirecting to payment page...')
        } else {
          toast.success('Payment request submitted successfully')
        }
      }
      onOpenChange(false)
      onPaymentSuccess?.()
    } catch (error) {
      console.error('Failed to request payment:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to request payment. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            Pay for Order
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Payment Methods */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Payment Methods:</Label>
            <div className='grid grid-cols-3 gap-3'>
              {/* Balance */}
              <button
                type='button'
                onClick={() => setSelectedPaymentMethod('balance')}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  selectedPaymentMethod === 'balance'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800'
                }`}
              >
                <Coins className='mb-2 h-6 w-6' />
                <span className='text-sm font-medium'>Balance</span>
              </button>

              {/* Credit Card */}
              <button
                type='button'
                onClick={() => setSelectedPaymentMethod('credit_card')}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                  selectedPaymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800'
                }`}
              >
                <CreditCard className='mb-2 h-6 w-6' />
                <span className='text-sm font-medium'>Credit card</span>
              </button>

              {/* Airwallex */}
              <button
                type='button'
                onClick={() => setSelectedPaymentMethod('airwallex')}
                disabled
                className={`relative flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 p-4 opacity-60 transition-all ${
                  selectedPaymentMethod === 'airwallex'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className='mb-2 h-6 w-16 rounded bg-gray-400'></div>
                <span className='text-sm font-medium text-gray-500'>
                  Airwallex
                </span>
              </button>
            </div>
          </div>

          {/* Recommendation */}
          <div className='space-y-1 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950'>
            <p className='text-sm font-medium text-orange-800 dark:text-orange-200'>
              Recomended! Get 1~2.5% bonus when recharging with XT and Payoneer.
            </p>
            <p className='text-xs text-orange-700 dark:text-orange-300'>
              Pay without limit on amount or number of orders.
            </p>
          </div>

          {/* Order Summary */}
          <div className='space-y-3 border-t pt-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Total Amount :</span>
              <span className='text-sm font-semibold text-orange-600'>
                {isLoadingBalance
                  ? '...'
                  : `Pay $${availableBalance.toFixed(2)}`}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Balance:</span>
              <span className='text-sm font-semibold text-orange-600'>
                {isLoadingBalance ? '...' : `$${balance.toFixed(2)}`}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Bonus:</span>
              <span className='text-sm font-semibold text-orange-600'>
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Credits:</span>
              <span className='text-sm font-semibold'>
                ${credits.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>No. of Orders:</span>
              <span className='text-sm font-semibold'>{numberOfOrders}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 border-t pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className='bg-blue-500 hover:bg-blue-600'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
