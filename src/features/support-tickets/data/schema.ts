import { type ApiAfterSaleOrderItem } from '@/lib/api/orders'

export type SupportTicketStatus =
  | 'all'
  | 'processing'
  | 'finished'
  | 'refused'
  | 'cancelled'

export type SupportTicketType = 'Product return' | 'Other'

// SupportTicket 类型扩展了 ApiAfterSaleOrderItem，以支持 API 返回的原始字段
export type SupportTicket = ApiAfterSaleOrderItem & {
  id: string
  supportTicketNo?: string
  hzOrderNo?: string
  hzSku?: string
  variant?: string
  qty?: number
  totalPrice?: number
  productImage?: string
  returnQty?: number
  storeName?: string
  type?: SupportTicketType
  status?: Exclude<SupportTicketStatus, 'all'>
  createTime?: string
  updateTime?: string
  remarks?: string
  reason?: string
  // API 原始字段
  number?: string // NO 显示的是 number
  hzkj_shop_name?: string // Store Name
  hzkj_sales_type_title?: string // Type 显示文本
}

