import { type Table } from '@tanstack/react-table'
import { ServerTablePaginationBar } from '@/components/data-table'
import { type SampleOrderTableRow } from '../data/schema'

type SampleOrdersTableFooterProps = {
  table: Table<SampleOrderTableRow>
  /** 保留与调用方兼容；分页展示以 table 的 pageCount 为准 */
  totalRows?: number
}

export function SampleOrdersTableFooter({ table }: SampleOrdersTableFooterProps) {
  return <ServerTablePaginationBar table={table} />
}
