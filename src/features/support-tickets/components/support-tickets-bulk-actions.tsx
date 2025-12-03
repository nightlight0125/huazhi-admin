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
import { type SupportTicket } from '../data/schema'

interface SupportTicketsBulkActionsProps {
  table: Table<SupportTicket>
}

export function SupportTicketsBulkActions({
  table,
}: SupportTicketsBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Export support tickets:', selected)
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Delete support tickets:', selected)
    table.resetRowSelection()
  }

  const handleBulkAction = (action: string) => {
    const selected = selectedRows.map((row) => row.original)
    console.log(`Bulk action [${action}] on support tickets:`, selected)
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='ticket'>
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
          <DropdownMenuItem onClick={() => handleBulkAction('mark_processing')}>
            Mark as Processing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('mark_finished')}>
            Mark as Finished
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('mark_cancelled')}>
            Mark as Cancelled
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
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_time')}>
            Sort by Create Time
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleBulkAction('sort_by_status')}
          >
            Sort by Status
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
            aria-label='Export support tickets'
            title='Export support tickets'
          >
            <Download />
            <span className='sr-only'>Export support tickets</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export support tickets</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            className='size-8'
            aria-label='Delete selected tickets'
            title='Delete selected tickets'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected tickets</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected tickets</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}


