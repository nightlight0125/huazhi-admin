import { type Table } from '@tanstack/react-table'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  entityName: string
  children: React.ReactNode
}

/**
 * 批量操作栏（已移除 UI，保留空组件以兼容调用方）
 */
export function DataTableBulkActions<TData>(
  _props: DataTableBulkActionsProps<TData>
): React.ReactNode | null {
  return null
}
