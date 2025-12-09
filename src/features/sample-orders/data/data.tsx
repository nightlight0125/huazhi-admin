import {
  CheckCircle,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react'

// 订单状态选项
export const sampleOrderStatuses = [
  {
    label: 'AlI',
    value: 'all' as const,
    icon: Package,
  },
  {
    label: 'Awaiting Payment',
    value: 'pending_payment' as const,
    icon: DollarSign,
  },
  {
    label: 'paid',
    value: 'paid' as const,
    icon: CheckCircle,
  },
  {
    label: 'processing',
    value: 'processing' as const,
    icon: ShoppingCart,
  },
  {
    label: 'shipped',
    value: 'shipped' as const,
    icon: Truck,
  },
  {
    label: 'cancelled',
    value: 'cancelled' as const,
    icon: XCircle,
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
