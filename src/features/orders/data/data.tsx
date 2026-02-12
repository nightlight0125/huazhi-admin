import { AlertCircle, CheckCircle, Clock, Package, Truck } from 'lucide-react'
import { allCountries } from '@/lib/countries'

// 订单状态选项
export const orderStatuses = [
  {
    label: 'AlI',
    value: '' as const,
  },
  {
    label: 'Pending',
    value: 'pending' as const,
  },
  {
    label: 'Authorized',
    value: 'authorized' as const,
  },
  {
    label: 'Partially Paid',
    value: 'partially_paid' as const,
  },
  {
    label: 'Paid',
    value: 'paid' as const,
  },
  {
    label: 'Refunded',
    value: 'refunded' as const,
  },
  {
    label: 'Partially Refunded',
    value: 'partially_refunded' as const,
  },
  {
    label: 'Voided',
    value: 'voided' as const,
  },
  {
    label: 'Expired',
    value: 'expired' as const,
  },
]

// 平台订单状态选项
export const platformOrderStatuses = [
  {
    label: 'Cancelled',
    value: '0' as const,
  },
  {
    label: 'Not Linked to Local SKU',
    value: 'no' as const,
  },
  {
    label: 'Pending Payment',
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

// 国家选项（仅用于不需要国旗的地方）
export const countries = allCountries.map((c) => ({
  label: c.name,
  value: c.code,
}))
