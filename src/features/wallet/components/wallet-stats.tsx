import { useState } from 'react'
import { Building2, DollarSign, Gift, Wallet } from 'lucide-react'
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

export function WalletStats({ stats }: WalletStatsProps) {
  const [topupAmount, setTopupAmount] = useState('0')
  const [currency, setCurrency] = useState('USD')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null)

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
            {stats.accountBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardTitle>
          <div className='text-muted-foreground mt-1 text-xs'>Bonus: $0.00</div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Separator />
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Gift className='h-5 w-5 text-purple-600' />
              <CardDescription>Benefits Tiers</CardDescription>
            </div>
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
            <DollarSign className='h-5 w-5 text-green-600' />
            <CardDescription>Topup Amount</CardDescription>
          </div>
          <CardContent className='p-0 pt-4'>
            <div className='flex gap-2'>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className='h-9 w-[100px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='GBP'>GBP</SelectItem>
                  <SelectItem value='CNY'>CNY</SelectItem>
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
