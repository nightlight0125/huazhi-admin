import { type Table } from '@tanstack/react-table'
import { ServerTablePaginationBar } from '@/components/data-table'
import { type StockOrder } from '../data/schema'

type StockOrdersTableFooterProps = {
  table: Table<StockOrder>
  /** 保留与调用方兼容；分页展示以 table 的 pageCount 为准 */
  totalRows?: number
}

export function StockOrdersTableFooter({ table }: StockOrdersTableFooterProps) {
  return <ServerTablePaginationBar table={table} />
}
