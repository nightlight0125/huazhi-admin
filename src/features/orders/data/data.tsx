import { AlertCircle, CheckCircle, Clock, Package, Truck } from 'lucide-react'
import { allCountries } from '@/lib/countries'

// 订单状态选项
export const orderStatuses = [
  {
    label: 'AlI',
    value: '' as const,
  },
  {
    label: 'Unconnected',
    value: 'no' as const,
  },
  {
    label: 'Awaiting Payment',
    value: '1' as const,
  },
  {
    label: 'Paid',
    value: '2' as const,
  },
  {
    label: 'Processing',
    value: '3' as const,
  },
  {
    label: 'Shipped',
    value: '4' as const,
  },
  {
    label: 'Cancelled',
    value: '0' as const,
  },
]

// 平台订单状态选项（label 与 value 一一对应）
export const platformOrderStatuses = [
  { label: 'pending', value: 'pending' as const },
  { label: 'authorized', value: 'authorized' as const },
  { label: 'partially_paid', value: 'partially_paid' as const },
  { label: 'paid', value: 'paid' as const },
  { label: 'refunded', value: 'refunded' as const },
  { label: 'voided', value: 'voided' as const },
  { label: 'expired', value: 'expired' as const },
  { label: 'unpaid', value: 'unpaid' as const },
  { label: 'due', value: 'due' as const },
]

// 平台履行状态选项
export const platformFulfillmentStatuses = [
  {
    label: 'Unfulfilled',
    value: 'unfulfilled' as const,
    icon: Clock,
  },
  {
    label: 'Partial',
    value: 'partial' as const,
    icon: AlertCircle,
  },
  {
    label: 'Fulfilled',
    value: 'fulfilled' as const,
    icon: CheckCircle,
  },
  {
    label: 'Restocked',
    value: 'restocked' as const,
    icon: Package,
  },
]

// 物流状态选项
export const logisticsStatuses = [
  {
    label: 'Pending',
    value: 'pending' as const,
    icon: Clock,
  },
  {
    label: 'Picked Up',
    value: 'picked_up' as const,
    icon: Package,
  },
  {
    label: 'In Transit',
    value: 'in_transit' as const,
    icon: Truck,
  },
  {
    label: 'Delivered',
    value: 'delivered' as const,
    icon: CheckCircle,
  },
  {
    label: 'Exception',
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

// 国家选项（仅用于不需要国旗的地方）
export const countries = allCountries.map((c) => ({
  label: c.name,
  value: c.code,
}))
