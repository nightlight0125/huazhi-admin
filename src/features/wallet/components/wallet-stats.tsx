import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { IconPaypal, IconStripe } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { getCurrency, type CurrencyItem } from '@/lib/api/base'
import { getWalletInfo, requestWalletPayment } from '@/lib/api/wallet'
import { payTypeForWalletTopupMethod } from '@/lib/third-party-pay-type'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { type WalletStats } from '../data/schema'

interface WalletStatsProps {
  stats: WalletStats
}

// 福利层级数据
const benefitTiers = [
  { min: 2000.0, max: 3000.0, percentage: 1.0 },
  { min: 3000.0, max: 5000.0, percentage: 2.0 },
  { min: 5000.0, max: 99999.0, percentage: 2.5 },
]

export function WalletStats({ stats: _stats }: WalletStatsProps) {
  const { auth } = useAuthStore()
  const [topupAmount, setTopupAmount] = useState('0')
  /** 充值固定 USD；仍请求货币列表以解析后端 currency id */
  const [usdCurrency, setUsdCurrency] = useState<CurrencyItem | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [rebateAmount, setRebateAmount] = useState(0)
  const [amountError, setAmountError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // 解析 USD 对应的后端 currency id
  useEffect(() => {
    const fetchUsdCurrency = async () => {
      try {
        const currencyList = await getCurrency(1, 100)
        const usd = currencyList.find((c) => c.number === 'USD')
        if (usd) {
          setUsdCurrency(usd)
        } else {
          setUsdCurrency(null)
          toast.error('USD currency is not available from the server.')
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error)
        setUsdCurrency(null)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load currencies. Please try again.'
        )
      }
    }

    void fetchUsdCurrency()
  }, [])

  // 获取钱包信息
  useEffect(() => {
    const fetchWalletInfo = async () => {
      const customerId = auth.user?.customerId || auth.user?.id
      if (!customerId) {
        console.warn('No customer ID available')
        return
      }

      try {
        const walletInfo = await getWalletInfo(String(customerId), 1, 10)
        setWalletBalance(walletInfo.balance)
        setRebateAmount(walletInfo.rebateAmount)
      } catch (error) {
        console.error('Failed to fetch wallet info:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load wallet info. Please try again.'
        )
        setWalletBalance(0)
        setRebateAmount(0)
      }
    }

    void fetchWalletInfo()
  }, [auth.user?.customerId, auth.user?.id])

  // 验证输入
  const validateInput = () => {
    // 验证金额
    const amount = parseFloat(topupAmount)
    if (!topupAmount || topupAmount === '0' || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0')
      return false
    }

    if (!usdCurrency) {
      toast.error('USD currency is not ready. Please refresh the page.')
      return false
    }

    // 获取客户ID
    const customerId = auth.user?.customerId || auth.user?.id
    if (!customerId) {
      toast.error('Customer ID not found. Please login again.')
      return false
    }

    return true
  }

  // 处理支付请求
  const handlePaymentRequest = async () => {
    if (!validateInput()) {
      return
    }

    const usd = usdCurrency
    if (!usd) {
      return
    }

    const amount = parseFloat(topupAmount)
    const customerId = auth.user?.customerId || auth.user?.id

    setIsLoading(true)
    try {
      const response = await requestWalletPayment({
        customerId: String(customerId),
        amount: amount,
        currency: usd.id,
        currencyNumber: usd.number.toLowerCase(),
        payType: payTypeForWalletTopupMethod(selectedPaymentMethod),
      })

      // 检查返回的 data 是否是链接
      if (response.data && typeof response.data === 'string') {
        // 在新窗口打开链接
        window.open(response.data, '_blank', 'noopener,noreferrer')
        toast.success('Redirecting to payment page...')
      } else {
        toast.success('Payment request submitted successfully')
      }

      // 重置表单
      setTopupAmount('0')
      setSelectedPaymentMethod(null)
      setShowConfirmDialog(false)

      // 刷新钱包信息
      const walletInfo = await getWalletInfo(String(customerId), 1, 10)
      setWalletBalance(walletInfo.balance)
      setRebateAmount(walletInfo.rebateAmount)
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

  /** Stripe / PayPal：校验后与 Stripe 相同，打开确认弹框 */
  const handleThirdPartyTopupClick = (
    method: 'bank-transfer' | 'bank-transfer-detailed'
  ) => {
    if (!validateInput()) {
      return
    }

    const amount = parseFloat(topupAmount)
    if (amount < 0.5) {
      toast.error('Minimum amount for Bank Transfer is 0.5')
      return
    }

    setSelectedPaymentMethod(method)
    setShowConfirmDialog(true)
  }

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card -mx-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6'>
      <Card className='@container/card'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Wallet className='text-primary h-5 w-5' />
            <CardDescription>Account balance</CardDescription>
          </div>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            $
            {walletBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardTitle>
          <div className='text-muted-foreground mt-1 text-xs'>
            Bonus: $
            {rebateAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Separator />
          <div className='space-y-2'>
            <div className='space-y-2'>
              {benefitTiers.map((tier, index) => (
                <div
                  key={index}
                  className='bg-muted/50 rounded-lg border p-2.5 text-xs'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>
                      ${tier.min.toFixed(0)}-{tier.max}
                      Benefits
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {tier.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topup and Payment Methods Card */}
      <Card className='@container/card'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <CardDescription>Topup Amount</CardDescription>
          </div>
          <CardContent className='p-0 pt-4'>
            <div className='space-y-2'>
              <div className='flex gap-2'>
                <div
                  className='bg-muted/50 text-muted-foreground flex h-9 shrink-0 items-center rounded-md border px-3 text-sm font-medium'
                  aria-label='Currency: USD'
                >
                  USD
                </div>
                <Input
                  id='topup-amount'
                  type='number'
                  min='0'
                  step='0.01'
                  value={topupAmount}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = parseFloat(value)

                    // 检查是否为负数
                    if (
                      value !== '' &&
                      (numValue < 0 || value.startsWith('-'))
                    ) {
                      setAmountError('Amount cannot be negative')
                      return
                    }

                    // 清除错误并更新值
                    setAmountError('')
                    setTopupAmount(value)
                  }}
                  placeholder='Enter amount'
                  className={
                    amountError ? 'border-destructive h-9 flex-1' : 'h-9 flex-1'
                  }
                />
              </div>
              {amountError && (
                <p className='text-destructive text-xs'>{amountError}</p>
              )}
            </div>
          </CardContent>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Separator />
          <div className='space-y-3'>
            <CardDescription>Payment Methods</CardDescription>
            <p className='text-muted-foreground text-sm leading-tight'>
              Welcome to your billing dashboard. Make payments and review your
              transactions history here.
            </p>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
              {/* Bank Transfer (Generic) */}
              <Button
                variant={
                  selectedPaymentMethod === 'bank-transfer'
                    ? 'default'
                    : 'outline'
                }
                className='h-auto flex-col items-start gap-2 p-3'
                disabled={isLoading}
                onClick={() => handleThirdPartyTopupClick('bank-transfer')}
              >
                <IconStripe className='h-8 w-10 text-[#635BFF]' aria-hidden />
                <span className='text-sm font-medium'>Stripe</span>
              </Button>

              {/* PayPal — 与 Stripe 相同：校验后打开确认弹框 */}
              <Button
                variant={
                  selectedPaymentMethod === 'bank-transfer-detailed'
                    ? 'default'
                    : 'outline'
                }
                className='h-auto flex-col items-start gap-2 p-3'
                disabled={isLoading}
                onClick={() =>
                  handleThirdPartyTopupClick('bank-transfer-detailed')
                }
              >
                <div className='flex w-full items-center justify-between'>
                  <IconPaypal className='h-5 w-5 text-[#003087]' aria-hidden />
                </div>
                <div className='flex w-full flex-col items-start gap-0.5'>
                  <span className='text-sm font-medium'>PayPal</span>
                </div>
              </Button>

              {/* Payoneer */}
              <Button
                variant={
                  selectedPaymentMethod === 'payoneer' ? 'default' : 'outline'
                }
                className='h-auto flex-col items-start gap-2 p-3'
                onClick={() => setSelectedPaymentMethod('payoneer')}
              >
                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-blue-500'>
                  <span className='text-xs font-bold text-white'>P</span>
                </div>
                <span className='text-sm font-medium'>Payoneer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to proceed with this payment request?
              <br />
              <br />
              <strong>Method:</strong>{' '}
              {selectedPaymentMethod === 'bank-transfer-detailed'
                ? 'PayPal'
                : selectedPaymentMethod === 'bank-transfer'
                  ? 'Stripe'
                  : '—'}
              <br />
              <strong>Amount:</strong> USD{' '}
              {parseFloat(topupAmount || '0').toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePaymentRequest}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
