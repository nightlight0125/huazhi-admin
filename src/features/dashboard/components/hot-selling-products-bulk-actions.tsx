import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type HotSellingProduct } from '../data/schema'

interface HotSellingProductsBulkActionsProps {
  table: Table<HotSellingProduct>
}

export function HotSellingProductsBulkActions({
  table,
}: HotSellingProductsBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedProducts = selectedRows.map((row) => row.original)
    console.log('Export products:', selectedProducts)
    // TODO: 实现导出逻辑
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selectedProducts = selectedRows.map((row) => row.original)
    console.log('Delete products:', selectedProducts)
    // TODO: 实现删除逻辑
    table.resetRowSelection()
  }

  const handleBulkAction = (action: string) => {
    const selectedProducts = selectedRows.map((row) => row.original)
    console.log(`Bulk action: ${action}`, selectedProducts)
    // TODO: 实现批量操作逻辑
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='product'>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Bulk actions'
                title='Bulk actions'
              >
                <CircleArrowUp />
                <span className='sr-only'>Bulk actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bulk actions</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem onClick={() => handleBulkAction('update_status')}>
            Update Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('update_category')}>
            Update Category
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('update_price')}>
            Update Price
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Sort options'
                title='Sort options'
              >
                <ArrowUpDown />
                <span className='sr-only'>Sort options</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort options</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_ranking')}>
            Sort by Ranking
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleBulkAction('sort_by_quantity')}
          >
            Sort by Quantity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_amount')}>
            Sort by Amount
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={handleBulkExport}
            className='size-8'
            aria-label='Export products'
            title='Export products'
          >
            <Download />
            <span className='sr-only'>Export products</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export products</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            className='size-8'
            aria-label='Delete selected products'
            title='Delete selected products'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected products</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected products</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
