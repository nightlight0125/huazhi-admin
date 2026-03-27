import { Trash2 } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { TRASH_DELETE_OUTLINE_DESTRUCTIVE_ICON_CLASS } from '@/lib/delete-action-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useProducts } from './products-provider'

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { setOpen } = useProducts()
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
        className='group h-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
        onClick={() => {
          // 这里可以实现批量删除逻辑
          setOpen('delete')
        }}
      >
        <Trash2
          className={cn(
            TRASH_DELETE_OUTLINE_DESTRUCTIVE_ICON_CLASS,
            'mr-2 h-4 w-4'
          )}
        />
        删除 ({selectedRows.length})
      </Button>
    </div>
  )
}
