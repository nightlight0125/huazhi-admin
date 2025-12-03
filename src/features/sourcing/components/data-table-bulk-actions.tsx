import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
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
import { type Sourcing } from '../data/schema'

interface SourcingBulkActionsProps {
  table: Table<Sourcing>
}

export function DataTableBulkActions({ table }: SourcingBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkAction = (action: string) => {
    const items = selectedRows.map((row) => row.original)
    console.log(`Bulk action [${action}] on sourcing:`, items)
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='sourcing'>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Bulk update status'
                title='Bulk update status'
              >
                <CircleArrowUp />
                <span className='sr-only'>Bulk update status</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bulk update status</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem onClick={() => handleBulkAction('set-processing')}>
            Set to Processing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('set-completed')}>
            Set to Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('set-failed')}>
            Set to Failed
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
          <DropdownMenuItem onClick={() => handleBulkAction('sort-by-date')}>
            Sort by Date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort-by-status')}>
            Sort by Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkAction('export')}
            className='size-8'
            aria-label='Export sourcing'
            title='Export sourcing'
          >
            <Download />
            <span className='sr-only'>Export sourcing</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export sourcing</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => handleBulkAction('delete')}
            className='size-8'
            aria-label='Delete selected sourcing'
            title='Delete selected sourcing'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected sourcing</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected sourcing</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}


