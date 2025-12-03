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
import { type InventoryItem } from '../data/schema'

interface InventoryBulkActionsProps {
  table: Table<InventoryItem>
}

export function InventoryBulkActions({ table }: InventoryBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Export inventory items:', selected)
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Delete inventory items:', selected)
    table.resetRowSelection()
  }

  const handleBulkAction = (action: string) => {
    const selected = selectedRows.map((row) => row.original)
    console.log(`Bulk action [${action}] on inventory items:`, selected)
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
          <DropdownMenuItem onClick={() => handleBulkAction('update_qty')}>
            Update Quantity
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
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_qty')}>
            Sort by Quantity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_price')}>
            Sort by Price
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
            aria-label='Export inventory items'
            title='Export inventory items'
          >
            <Download />
            <span className='sr-only'>Export inventory items</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export inventory items</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            className='size-8'
            aria-label='Delete selected inventory items'
            title='Delete selected inventory items'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected inventory items</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected inventory items</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}


