import { type Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type StockOrder } from '../data/schema'

type StockOrdersTableFooterProps = {
  table: Table<StockOrder>
}

export function StockOrdersTableFooter({
  table,
}: StockOrdersTableFooterProps) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const isAllPageSelected = table.getIsAllPageRowsSelected()
  const isSomePageSelected = table.getIsSomePageRowsSelected()

  // Calculate total amount for selected orders
  const totalAmount = selectedRows.reduce((sum, row) => {
    return sum + (row.original.cost.total || 0)
  }, 0)

  const handlePageSelect = (checked: boolean) => {
    if (checked) {
      table.toggleAllPageRowsSelected(true)
    } else {
      table.toggleAllPageRowsSelected(false)
    }
  }

  const handleAllSelect = (checked: boolean) => {
    // Select all rows across all pages
    if (checked) {
      table.toggleAllPageRowsSelected(true)
      // TODO: Implement select all across pages
    } else {
      table.toggleAllPageRowsSelected(false)
    }
  }

  const handleBatchPayment = () => {
    if (selectedCount > 0) {
      // TODO: Implement batch payment dialog
      console.log(
        'Batch payment for orders:',
        selectedRows.map((row) => row.original.id)
      )
    }
  }

  return (
    <div className='flex items-center justify-between border-t bg-white px-4 py-3'>
      {/* Left: Selection checkboxes and count */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='page-select'
            checked={
              isAllPageSelected ||
              (isSomePageSelected && !isAllPageSelected
                ? 'indeterminate'
                : false)
            }
            onCheckedChange={handlePageSelect}
          />
          <label
            htmlFor='page-select'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Page
          </label>
        </div>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='all-select'
            checked={false}
            onCheckedChange={handleAllSelect}
          />
          <label
            htmlFor='all-select'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            All Orders
          </label>
        </div>
        <div className='text-sm'>
          Selected:{' '}
          <span className='font-semibold text-orange-500'>{selectedCount}</span>
        </div>
      </div>

      {/* Center: Pagination */}
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {/* Page number buttons */}
        {pageNumbers.map((pageNumber, index) => (
          <div key={`${pageNumber}-${index}`} className='flex items-center'>
            {pageNumber === '...' ? (
              <span className='px-2 text-sm text-gray-500'>...</span>
            ) : (
              <Button
                variant={currentPage === pageNumber ? 'default' : 'ghost'}
                size='sm'
                className={cn(
                  'h-8 min-w-8 px-2',
                  currentPage === pageNumber &&
                    'bg-blue-500 text-white hover:bg-blue-600'
                )}
                onClick={() => table.setPageIndex((pageNumber as number) - 1)}
              >
                {pageNumber}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Right: Total amount and batch payment button */}
      <div className='flex items-center gap-4'>
        <div className='flex flex-col items-end'>
          <div className='text-sm'>
            Total Amount:{' '}
            <span className='font-medium'>
              {selectedCount > 0 ? `$${totalAmount.toFixed(2)}` : '---'}
            </span>
          </div>
          <div className='flex items-center gap-1 text-xs text-orange-500'>
            <HelpCircle className='h-3 w-3' />
            <span>Referenced amount</span>
          </div>
        </div>
        <Button
          onClick={handleBatchPayment}
          disabled={selectedCount === 0}
          className='bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
        >
          Batch Payment
        </Button>
      </div>
    </div>
  )
}

