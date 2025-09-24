import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Pause,
  DollarSign,
  ShoppingCart,
  MapPin,
  Building,
  Globe,
} from 'lucide-react'

// 订单状态选项
export const orderStatuses = [
  {
    label: '全部',
    value: 'all' as const,
    icon: Package,
  },
  {
    label: '待报价',
    value: 'pending_quote' as const,
    icon: Clock,
  },
  {
    label: '待付款',
    value: 'pending_payment' as const,
    icon: DollarSign,
  },
  {
    label: '已付款',
    value: 'paid' as const,
    icon: CheckCircle,
  },
  {
    label: '处理中',
    value: 'processing' as const,
    icon: ShoppingCart,
  },
  {
    label: '已发货',
    value: 'shipped' as const,
    icon: Truck,
  },
  {
    label: '缺货',
    value: 'out_of_stock' as const,
    icon: AlertCircle,
  },
  {
    label: '已取消',
    value: 'cancelled' as const,
    icon: XCircle,
  },
  {
    label: '订单搁置',
    value: 'on_hold' as const,
    icon: Pause,
  },
]

// 平台订单状态选项
export const platformOrderStatuses = [
  {
    label: '待处理',
    value: 'pending' as const,
    icon: Clock,
  },
  {
    label: '已确认',
    value: 'confirmed' as const,
    icon: CheckCircle,
  },
  {
    label: '处理中',
    value: 'processing' as const,
    icon: ShoppingCart,
  },
  {
    label: '已发货',
    value: 'shipped' as const,
    icon: Truck,
  },
  {
    label: '已送达',
    value: 'delivered' as const,
    icon: CheckCircle,
  },
  {
    label: '已取消',
    value: 'cancelled' as const,
    icon: XCircle,
  },
  {
    label: '已退款',
    value: 'refunded' as const,
    icon: DollarSign,
  },
]

// 平台履行状态选项
export const platformFulfillmentStatuses = [
  {
    label: '未履行',
    value: 'unfulfilled' as const,
    icon: Clock,
  },
  {
    label: '部分履行',
    value: 'partial' as const,
    icon: AlertCircle,
  },
  {
    label: '已履行',
    value: 'fulfilled' as const,
    icon: CheckCircle,
  },
  {
    label: '已补货',
    value: 'restocked' as const,
    icon: Package,
  },
]

// 物流状态选项
export const logisticsStatuses = [
  {
    label: '待处理',
    value: 'pending' as const,
    icon: Clock,
  },
  {
    label: '已取件',
    value: 'picked_up' as const,
    icon: Package,
  },
  {
    label: '运输中',
    value: 'in_transit' as const,
    icon: Truck,
  },
  {
    label: '已送达',
    value: 'delivered' as const,
    icon: CheckCircle,
  },
  {
    label: '异常',
    value: 'exception' as const,
    icon: AlertCircle,
  },
]

// 店铺选项
export const stores = [
  { label: '淘宝店铺', value: 'taobao' },
  { label: '天猫店铺', value: 'tmall' },
  { label: '京东店铺', value: 'jd' },
  { label: '拼多多店铺', value: 'pdd' },
  { label: '亚马逊店铺', value: 'amazon' },
  { label: 'eBay店铺', value: 'ebay' },
]

// 物流选项
export const logistics = [
  { label: '顺丰速运', value: 'sf' },
  { label: '圆通速递', value: 'yto' },
  { label: '中通快递', value: 'zto' },
  { label: '申通快递', value: 'sto' },
  { label: '韵达速递', value: 'yd' },
  { label: '京东物流', value: 'jd_logistics' },
  { label: '菜鸟裹裹', value: 'cainiao' },
]

// 发货地选项
export const shippingOrigins = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '成都', value: 'chengdu' },
  { label: '武汉', value: 'wuhan' },
  { label: '西安', value: 'xian' },
]

// 国家选项
export const countries = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '英国', value: 'uk' },
  { label: '德国', value: 'germany' },
  { label: '法国', value: 'france' },
  { label: '日本', value: 'japan' },
  { label: '韩国', value: 'korea' },
  { label: '澳大利亚', value: 'australia' },
]
