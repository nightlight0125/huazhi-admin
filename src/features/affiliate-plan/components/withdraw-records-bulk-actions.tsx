import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type WithdrawRecord } from '../data/schema'

interface WithdrawRecordsBulkActionsProps {
  table: Table<WithdrawRecord>
}

export function WithdrawRecordsBulkActions({
  table,
}: WithdrawRecordsBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkAction = (action: string) => {
    const items = selectedRows.map((row) => row.original)
    console.log(`Bulk action [${action}] on withdraw records:`, items)
    // TODO: Implement actual bulk actions
  }

  return (
    <BulkActionsToolbar table={table} entityName='record'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkAction('upload')}
            className='size-8'
            aria-label='Upload'
            title='Upload'
          >
            <CircleArrowUp />
            <span className='sr-only'>Upload</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkAction('reorder')}
            className='size-8'
            aria-label='Reorder'
            title='Reorder'
          >
            <ArrowUpDown />
            <span className='sr-only'>Reorder</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reorder</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkAction('download')}
            className='size-8'
            aria-label='Download'
            title='Download'
          >
            <Download />
            <span className='sr-only'>Download</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => handleBulkAction('delete')}
            className='size-8'
            aria-label='Delete selected records'
            title='Delete selected records'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected records</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected records</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}

