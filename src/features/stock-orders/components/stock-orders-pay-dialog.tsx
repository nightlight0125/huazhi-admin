import { useState } from 'react'
import { X, Coins, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type StockOrder } from '../data/schema'

interface StockOrdersPayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: StockOrder | null
}

type PaymentMethod = 'balance' | 'credit_card' | 'airwallex'

export function StockOrdersPayDialog({
  open,
  onOpenChange,
  order,
}: StockOrdersPayDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('balance')

  if (!order) return null

  // 模拟数据
  const balance = 382.52
  const bonus = 0
  const credits = 0
  const totalAmount = order.cost.total
  const balancePayment = totalAmount
  const numberOfOrders = 1

  const handleConfirm = () => {
    console.log('Payment confirmed:', {
      orderId: order.id,
      paymentMethod: selectedPaymentMethod,
      amount: totalAmount,
    })
    // TODO: Implement payment logic
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>Pay for Order</span>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={() => onOpenChange(false)}
            >
              <X className='h-4 w-4' />
            </Button>
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
                className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedPaymentMethod === 'balance'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-white dark:bg-gray-800 hover:border-gray-300'
                }`}
              >
                <Coins className='h-6 w-6 mb-2' />
                <span className='text-sm font-medium'>Balance</span>
              </button>

              {/* Credit Card */}
              <button
                type='button'
                onClick={() => setSelectedPaymentMethod('credit_card')}
                disabled
                className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-not-allowed opacity-60 ${
                  selectedPaymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <CreditCard className='h-6 w-6 mb-2 text-gray-400' />
                <span className='text-sm font-medium text-gray-500'>Credit card</span>
                <span className='text-xs text-gray-400 mt-1'>
                  Instant processing
                </span>
                <div className='flex gap-1 mt-2'>
                  <div className='w-6 h-4 bg-blue-600 rounded'></div>
                  <div className='w-6 h-4 bg-red-600 rounded'></div>
                </div>
              </button>

              {/* Airwallex */}
              <button
                type='button'
                onClick={() => setSelectedPaymentMethod('airwallex')}
                disabled
                className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-not-allowed opacity-60 ${
                  selectedPaymentMethod === 'airwallex'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className='h-6 w-16 mb-2 bg-gray-400 rounded'></div>
                <span className='text-sm font-medium text-gray-500'>Airwallex</span>
              </button>
            </div>
          </div>

          {/* Recommendation */}
          <div className='bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3 space-y-1'>
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
                Pay ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>
                Balance(${balance.toFixed(2)}):
              </span>
              <span className='text-sm font-semibold text-orange-600'>
                Pay ${balancePayment.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Bonus(${bonus.toFixed(2)}):</span>
              <span className='text-sm font-semibold text-orange-600'>
                Pay —
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Credits:</span>
              <span className='text-sm font-semibold'>${credits.toFixed(2)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>No. of Orders:</span>
              <span className='text-sm font-semibold'>{numberOfOrders}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className='bg-blue-500 hover:bg-blue-600'>
              Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

