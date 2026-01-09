import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { graphicStatistics } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'

interface ChartDataItem {
  date: string
  orderQuantity: number
  orderAmount: number
  paidAmount: number
}

export function Overview() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<ChartDataItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 获取统计数据
  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId || auth.user?.id
      if (!customerId) {
        return
      }

      setIsLoading(true)
      try {
        const statistics = await graphicStatistics(String(customerId))

        // 将后端返回的对象格式转换为数组格式，并按日期排序
        const chartData: ChartDataItem[] = Object.entries(statistics)
          .map(([date, item]) => {
            const statItem = item as {
              orderCount?: number
              orderAmount?: number
              paidAmount?: number
            }
            return {
              date,
              orderQuantity: statItem.orderAmount || 0, // orderAmount 对应 Order Quantity
              orderAmount: statItem.orderCount || 0, // orderCount 对应 Order Amount
              paidAmount: statItem.paidAmount || 0,
            }
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )

        setData(chartData)
      } catch (error) {
        console.error('Failed to fetch graphic statistics:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load graphic statistics. Please try again.'
        )
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [auth.user?.customerId, auth.user?.id])

  // 计算 Y 轴的最大值（用于自适应）
  const maxValue = useMemo(() => {
    if (data.length === 0) return 1
    const maxOrderQuantity = Math.max(...data.map((d) => d.orderQuantity))
    const maxOrderAmount = Math.max(...data.map((d) => d.orderAmount))
    const maxPaidAmount = Math.max(...data.map((d) => d.paidAmount))
    const max = Math.max(maxOrderQuantity, maxOrderAmount, maxPaidAmount)
    // 向上取整到最近的10的倍数，并添加10%的边距
    return Math.ceil((max * 1.1) / 10) * 10 || 10
  }, [data])

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
      {isLoading ? (
        <div className='flex h-[350px] items-center justify-center'>
          <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
        </div>
      ) : data.length === 0 ? (
        <div className='flex h-[350px] items-center justify-center text-sm text-gray-500'>
          No data available
        </div>
      ) : (
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
              domain={[0, maxValue]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              }}
              formatter={(value: number, name: string) => [
                name === 'orderQuantity'
                  ? value
                  : name === 'orderAmount'
                    ? `$${value.toFixed(2)}`
                    : `$${value.toFixed(2)}`,
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
      )}
    </div>
  )
}
