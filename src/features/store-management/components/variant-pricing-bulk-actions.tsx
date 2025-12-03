import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type VariantPricing } from './variant-pricing-schema'

interface VariantPricingBulkActionsProps {
  table: Table<VariantPricing>
}

export function VariantPricingBulkActions({
  table,
}: VariantPricingBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) {
    return null
  }

  const handleClearSelection = () => {
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedVariants = selectedRows.map((row) => row.original)
    console.log('Export variants:', selectedVariants)
    // TODO: 实现导出逻辑
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selectedVariants = selectedRows.map((row) => row.original)
    console.log('Delete variants:', selectedVariants)
    // TODO: 实现删除逻辑
    table.resetRowSelection()
  }

  const handleBulkAction = (action: string) => {
    const selectedVariants = selectedRows.map((row) => row.original)
    console.log(`Bulk action: ${action}`, selectedVariants)
    // TODO: 实现批量操作逻辑（如批量修改价格、运费等）
    table.resetRowSelection()
  }

  return (
    <div className='border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 mt-1.5 flex items-center gap-x-2 rounded-xl border p-2 shadow-xl backdrop-blur-lg'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={handleClearSelection}
            className='size-6 rounded-full'
            aria-label='Clear selection'
            title='Clear selection'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Clear selection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clear selection</p>
        </TooltipContent>
      </Tooltip>

      <Separator className='h-5' orientation='vertical' aria-hidden='true' />

      <div className='flex items-center gap-x-1 text-xs'>
        <Badge
          variant='default'
          className='min-w-8 rounded-lg'
          aria-label={`${selectedCount} selected`}
        >
          {selectedCount}
        </Badge>{' '}
        <span className='hidden sm:inline'>variants</span> selected
      </div>

      <Separator className='h-5' orientation='vertical' aria-hidden='true' />

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
                <CircleArrowUp className='h-4 w-4' />
                <span className='sr-only'>Bulk actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bulk actions</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem onClick={() => handleBulkAction('update_price')}>
            Update Price
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('update_shipping_fee')}>
            Update Shipping Fee
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('update_color')}>
            Update Color
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
                <ArrowUpDown className='h-4 w-4' />
                <span className='sr-only'>Sort options</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort options</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_sku')}>
            Sort by SKU
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_price')}>
            Sort by Price
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('sort_by_color')}>
            Sort by Color
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
            aria-label='Export variants'
            title='Export variants'
          >
            <Download className='h-4 w-4' />
            <span className='sr-only'>Export variants</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export variants</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleBulkDelete}
            className='size-8'
            aria-label='Delete selected variants'
            title='Delete selected variants'
          >
            <Trash2 className='h-4 w-4' />
            <span className='sr-only'>Delete selected variants</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected variants</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

