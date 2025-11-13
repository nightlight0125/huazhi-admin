import { Download } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'

const data = [
  {
    date: '2025-10-20',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
  {
    date: '2025-10-21',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
  {
    date: '2025-10-22',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
  {
    date: '2025-10-23',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
  {
    date: '2025-10-24',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
  {
    date: '2025-10-25',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
  {
    date: '2025-10-26',
    orderQuantity: 0,
    orderAmount: 0,
    paidAmount: 0,
  },
]

export function Overview() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  return (
    <div className='space-y-4'>
      <div className='relative flex items-center justify-center'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-green-500' />
            <span className='text-sm'>Order Quantity</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-blue-500' />
            <span className='text-sm'>Order Amount</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-orange-500' />
            <span className='text-sm'>Paid Amount</span>
          </div>
        </div>
        <Button variant='outline' size='sm' className='absolute right-0'>
          <Download className='h-4 w-4' />
        </Button>
      </div>
      <ResponsiveContainer width='100%' height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis
            dataKey='date'
            stroke='#888888'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatDate}
          />
          <YAxis
            stroke='#888888'
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
            labelFormatter={(value) => value}
            formatter={(value: number, name: string) => [
              value,
              name === 'orderQuantity'
                ? 'Order Quantity'
                : name === 'orderAmount'
                  ? 'Order Amount'
                  : 'Paid Amount',
            ]}
          />
          <Line
            type='monotone'
            dataKey='orderQuantity'
            stroke='#22c55e'
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type='monotone'
            dataKey='orderAmount'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type='monotone'
            dataKey='paidAmount'
            stroke='#f97316'
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
