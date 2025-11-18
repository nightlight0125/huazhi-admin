import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* First Card: Account Balance and Benefits */}
      <Card className='h-[280px]'>
        <CardContent className='flex h-full flex-col p-4'>
          <div className='grid h-full grid-cols-10 gap-4'>
            <div className='col-span-4'>
              <div className='dark:to-card relative flex h-full flex-col justify-center overflow-hidden'>
                <div className='relative'>
                  <CardDescription className='mb-1 text-xs text-purple-600 dark:text-purple-400'>
                    Account balance
                  </CardDescription>
                  <CardTitle className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                    {formatCurrency(stats.accountBalance)}
                  </CardTitle>
                  <div className='text-muted-foreground mt-1 text-xs'>
                    Bonus: {formatCurrency(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits List - 6 columns */}
            <div className='col-span-6'>
              <div className='flex h-full flex-col justify-center space-y-2'>
                {benefitTiers.map((tier, index) => (
                  <div key={index} className='rounded-lg border p-2.5'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium'>
                        {tier.min.toFixed(2)}-
                        {tier.max === 99999.0 ? '∞' : tier.max.toFixed(2)}
                      </span>
                      <span className='text-xs font-semibold'>
                        Benefits {tier.percentage.toFixed(2)} %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Card: Billing Dashboard */}
      <Card className='h-[280px]'>
        <CardContent className='flex h-full flex-col space-y-3 overflow-y-auto p-4'>
          {/* Welcome Text */}
          <div>
            <p className='text-muted-foreground text-xs leading-tight'>
              Welcome to your billing dashboard. Make payments and review your
              transactions history here.
            </p>
          </div>

          {/* Topup Amount Input */}
          <div className='space-y-1.5'>
            <Label htmlFor='topup-amount' className='text-xs'>
              Topup Amount
            </Label>
            <div className='flex gap-2'>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className='h-8 w-[90px] text-xs'>
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
                placeholder='0'
                className='h-8 flex-1 text-xs'
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className='space-y-2'>
            <Label className='text-xs'>Payment Methods</Label>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
              {/* Bank Transfer (Generic) */}
              <Button
                variant={
                  selectedPaymentMethod === 'bank-transfer'
                    ? 'default'
                    : 'outline'
                }
                className='h-auto flex-col items-start gap-1.5 border-purple-200 p-2.5 hover:border-purple-300'
                onClick={() => setSelectedPaymentMethod('bank-transfer')}
              >
                <Building2 className='h-5 w-5' />
                <span className='text-xs font-medium'>Bank Transfer</span>
              </Button>

              {/* Bank Transfer (Detailed) */}
              <Button
                variant={
                  selectedPaymentMethod === 'bank-transfer-detailed'
                    ? 'default'
                    : 'outline'
                }
                className='h-auto flex-col items-start gap-1.5 border-purple-200 p-2.5 hover:border-purple-300'
                onClick={() =>
                  setSelectedPaymentMethod('bank-transfer-detailed')
                }
              >
                <div className='flex w-full items-center justify-between'>
                  <Building2 className='h-5 w-5' />
                  <div className='flex gap-0.5'>
                    <span className='text-[10px]'>🇺🇸</span>
                    <span className='text-[10px]'>🇬🇧</span>
                    <span className='text-[10px]'>🇨🇦</span>
                    <span className='text-[10px]'>🇦🇺</span>
                    <span className='text-[10px]'>🇪🇺</span>
                  </div>
                </div>
                <div className='flex w-full flex-col items-start gap-0.5'>
                  <span className='text-xs font-medium'>Bank transfer</span>
                  <span className='text-muted-foreground text-[10px]'>
                    Up to 1 business day
                  </span>
                </div>
              </Button>

              {/* Payoneer */}
              <Button
                variant={
                  selectedPaymentMethod === 'payoneer' ? 'default' : 'outline'
                }
                className='h-auto flex-col items-start gap-1.5 border-purple-200 p-2.5 hover:border-purple-300'
                onClick={() => setSelectedPaymentMethod('payoneer')}
              >
                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-blue-500'>
                  <span className='text-[10px] font-bold text-white'>P</span>
                </div>
                <span className='text-xs font-medium'>Payoneer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
