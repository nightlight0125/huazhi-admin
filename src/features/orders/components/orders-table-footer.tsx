import { type Table } from '@tanstack/react-table'
import { ServerTablePaginationBar } from '@/components/data-table'
import { type Order } from '../data/schema'

type OrdersTableFooterProps = {
  table: Table<Order>
  /** 保留与调用方兼容；分页展示以 table 的 pageCount 为准 */
  totalRows?: number
}

export function OrdersTableFooter({ table }: OrdersTableFooterProps) {
  return <ServerTablePaginationBar table={table} />
}
