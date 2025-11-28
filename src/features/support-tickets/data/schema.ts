export type SupportTicketStatus =
  | 'all'
  | 'processing'
  | 'finished'
  | 'refused'
  | 'cancelled'

export type SupportTicketType = 'Product return' | 'Other'

export type SupportTicket = {
  id: string
  supportTicketNo: string
  hzOrderNo: string
  hzSku: string
  variant: string
  qty: number
  totalPrice: number
  productImage?: string
  returnQty: number
  storeName: string
  type: SupportTicketType
  status: Exclude<SupportTicketStatus, 'all'>
  createTime: string
  updateTime: string
  remarks: string
  reason: string
}

