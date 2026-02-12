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

interface DataTableBulkActionsProps {
  // 由于 WalletTable 在不同 tab 下使用了不同的数据类型（WalletRecord 和 ApiInvoiceRecordItem），
  // 这里使用 Table<any> 来兼容两种情况
  table: Table<any>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Export wallet records:', selected)
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selected = selectedRows.map((row) => row.original)
    console.log('Delete wallet records:', selected)
    table.resetRowSelection()
  }

  const handleBulkAction = (action: string) => {
    const selected = selectedRows.map((row) => row.original)
    console.log(`Bulk action [${action}] on wallet records:`, selected)
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='record'>
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
          <DropdownMenuItem onClick={() => handleBulkAction('export_invoices')}>
            Export Invoices
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('mark_reviewed')}>
            Mark as Reviewed
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
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_amount')}>
            Sort by Amount
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_time')}>
            Sort by Time
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
            aria-label='Export wallet records'
            title='Export wallet records'
          >
            <Download />
            <span className='sr-only'>Export wallet records</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export wallet records</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
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
