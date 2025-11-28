import { CheckCircle, Clock, Package } from 'lucide-react'

// 订单状态选项
export const stockOrderStatuses = [
  {
    label: 'All',
    value: 'all' as const,
    icon: Package,
  },
  {
    label: 'unpaid ',
    value: 'unpaid' as const,
    icon: Clock,
  },
  {
    label: 'Paid',
    value: 'paid' as const,
    icon: CheckCircle,
  },
  {
    label: 'cancel',
    value: 'cancel' as const,
  },
]

// 物流选项
export const logistics = [
  { label: 'Yuntu', value: 'yuntu' },
  { label: '顺丰速运', value: 'sf' },
  { label: '圆通速递', value: 'yto' },
  { label: '中通快递', value: 'zto' },
  { label: '申通快递', value: 'sto' },
  { label: '韵达速递', value: 'yd' },
  { label: '京东物流', value: 'jd_logistics' },
  { label: '菜鸟裹裹', value: 'cainiao' },
]
