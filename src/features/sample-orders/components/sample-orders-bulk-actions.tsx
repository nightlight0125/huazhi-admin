import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { TRASH_DELETE_DESTRUCTIVE_ICON_CLASS } from '@/lib/delete-action-ui'
import { cn } from '@/lib/utils'
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
import { type SampleOrderTableRow } from '../data/schema'

interface SampleOrdersBulkActionsProps {
  table: Table<SampleOrderTableRow>
}

export function SampleOrdersBulkActions({
  table,
}: SampleOrdersBulkActionsProps) {
  const handleBulkAction = (_action: string) => {
    // TODO: Implement actual bulk actions
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='order'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkAction('upload')}
            className='size-8'
            aria-label='Upload or move up'
            title='Upload or move up'
          >
            <CircleArrowUp />
            <span className='sr-only'>Upload or move up</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload or move up</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Sort or reorder'
                title='Sort or reorder'
              >
                <ArrowUpDown />
                <span className='sr-only'>Sort or reorder</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort or reorder</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem onClick={() => handleBulkAction('sort-by-date')}>
            Sort by Date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort-by-status')}>
            Sort by Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort-by-amount')}>
            Sort by Amount
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
            aria-label='Export sample orders'
            title='Export sample orders'
          >
            <Download />
            <span className='sr-only'>Export sample orders</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export sample orders</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => handleBulkAction('delete')}
            className='group size-8'
            aria-label='Delete selected sample orders'
            title='Delete selected sample orders'
          >
            <Trash2
              className={cn(TRASH_DELETE_DESTRUCTIVE_ICON_CLASS, 'h-4 w-4')}
            />
            <span className='sr-only'>Delete selected sample orders</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected sample orders</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
