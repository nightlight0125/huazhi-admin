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
import { type StoreSku } from '../data/schema'

interface PackagingConnectionBulkActionsProps {
  table: Table<StoreSku>
}

export function PackagingConnectionBulkActions({
  table,
}: PackagingConnectionBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Export packaging connections:', selected)
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Delete packaging connections:', selected)
    table.resetRowSelection()
  }

  const handleBulkAction = (action: string) => {
    const selected = selectedRows.map((row) => row.original)
    console.log(`Bulk action [${action}] on packaging connections:`, selected)
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
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_price')}>
            Sort by Price
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_store')}>
            Sort by Store Name
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
            aria-label='Export packaging connections'
            title='Export packaging connections'
          >
            <Download />
            <span className='sr-only'>Export packaging connections</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export packaging connections</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            className='size-8'
            aria-label='Delete selected connections'
            title='Delete selected connections'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected connections</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected connections</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}


