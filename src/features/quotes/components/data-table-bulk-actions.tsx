import { Trash2 } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { useQuotes } from './quotes-provider'

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { setOpen } = useQuotes()
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
  }

  return (
    <div className='flex items-center gap-2'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {selectedRows.length} 项已选择
        {isFiltered && ' (已过滤)'}
      </div>
      <Button
        variant='outline'
        size='sm'
        className='h-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
        onClick={() => {
          // 这里可以实现批量删除逻辑
          setOpen('delete')
        }}
      >
        <Trash2 className='mr-2 h-4 w-4' />
        删除 ({selectedRows.length})
      </Button>
    </div>
  )
}
