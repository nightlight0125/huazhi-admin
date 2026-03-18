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
import { type LikedProduct } from '../data/schema'

interface LikedProductsBulkActionsProps {
  table: Table<LikedProduct>
}

export function LikedProductsBulkActions({
  table,
}: LikedProductsBulkActionsProps) {
  const handleBulkExport = () => {
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    table.resetRowSelection()
  }

  const handleBulkAction = (_action: string) => {
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
          <DropdownMenuItem onClick={() => handleBulkAction('add-tag')}>
            Add Tag
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('move-folder')}>
            Move to Folder
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
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_date')}>
            Sort by Date
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
            aria-label='Export liked products'
            title='Export liked products'
          >
            <Download />
            <span className='sr-only'>Export liked products</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export liked products</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            className='size-8'
            aria-label='Remove selected from collection'
            title='Remove selected from collection'
          >
            <Trash2 />
            <span className='sr-only'>Remove selected from collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove selected from collection</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
