import {
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  XCircle,
  AlertCircle,
} from 'lucide-react'

// 订单状态选项
export const sampleOrderStatuses = [
  {
    label: 'All',
    value: 'all' as const,
    icon: Package,
  },
  {
    label: 'Quoting',
    value: 'quoting' as const,
    icon: Clock,
  },
  {
    label: 'Pending',
    value: 'pending' as const,
    icon: DollarSign,
  },
  {
    label: 'Paid',
    value: 'paid' as const,
    icon: CheckCircle,
  },
  {
    label: 'Processing',
    value: 'processing' as const,
    icon: ShoppingCart,
  },
  {
    label: 'Shipped',
    value: 'shipped' as const,
    icon: Truck,
  },
  {
    label: 'Completed',
    value: 'completed' as const,
    icon: CheckCircle,
  },
  {
    label: 'Canceled',
    value: 'canceled' as const,
    icon: XCircle,
  },
  {
    label: 'Pay In Progress',
    value: 'pay_in_progress' as const,
    icon: AlertCircle,
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

