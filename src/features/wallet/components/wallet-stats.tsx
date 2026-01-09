import { useEffect, useRef, useState } from 'react'
import { Building2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getCurrency, type CurrencyItem } from '@/lib/api/base'
import { getWalletInfo } from '@/lib/api/wallet'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [currency, setCurrency] = useState('6') // 默认USD的id
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [rebateAmount, setRebateAmount] = useState(0)
  const hasInitializedCurrency = useRef(false)

  // 获取货币列表
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const currencyList = await getCurrency(1, 100)
        setCurrencies(currencyList)
        // 只在第一次加载时设置默认货币
        if (!hasInitializedCurrency.current && currencyList.length > 0) {
          hasInitializedCurrency.current = true
          setCurrency((currentCurrency) => {
            const currentCurrencyExists = currencyList.some(
              (c) => c.id === currentCurrency
            )
            if (!currentCurrencyExists) {
              const usdCurrency = currencyList.find((c) => c.number === 'USD')
              return usdCurrency ? usdCurrency.id : currencyList[0].id
            }
            return currentCurrency
          })
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load currencies. Please try again.'
        )
      }
    }

    void fetchCurrencies()
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

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card -mx-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6'>
      {/* Account Balance and Benefits Card */}
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
                      ${tier.min.toFixed(0)}-
                      {tier.max === 99999.0 ? '∞' : `$${tier.max.toFixed(0)}`}
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
            <div className='flex gap-2'>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className='h-9 w-[100px]'>
                  <SelectValue>
                    {currencies.find((c) => c.id === currency)?.number || 'USD'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currencyItem) => (
                    <SelectItem key={currencyItem.id} value={currencyItem.id}>
                      {currencyItem.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id='topup-amount'
                type='number'
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder='Enter amount'
                className='h-9 flex-1'
              />
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
                onClick={() => setSelectedPaymentMethod('bank-transfer')}
              >
                <Building2 className='h-5 w-5' />
                <span className='text-sm font-medium'>Bank Transfer</span>
              </Button>

              {/* Bank Transfer (Detailed) */}
              <Button
                variant={
                  selectedPaymentMethod === 'bank-transfer-detailed'
                    ? 'default'
                    : 'outline'
                }
                className='h-auto flex-col items-start gap-2 p-3'
                onClick={() =>
                  setSelectedPaymentMethod('bank-transfer-detailed')
                }
              >
                <div className='flex w-full items-center justify-between'>
                  <Building2 className='h-5 w-5' />
                  <div className='flex gap-0.5'>
                    <span className='text-xs'>🇺🇸</span>
                    <span className='text-xs'>🇬🇧</span>
                    <span className='text-xs'>🇨🇦</span>
                    <span className='text-xs'>🇦🇺</span>
                    <span className='text-xs'>🇪🇺</span>
                  </div>
                </div>
                <div className='flex w-full flex-col items-start gap-0.5'>
                  <span className='text-sm font-medium'>Bank transfer</span>
                  <span className='text-muted-foreground text-xs'>
                    Up to 1 business day
                  </span>
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
    </div>
  )
}
