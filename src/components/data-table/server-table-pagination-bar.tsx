import { type Table } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ServerTablePaginationBarProps<TData> = {
  table: Table<TData>
  className?: string
}

export function ServerTablePaginationBar<TData>({
  table,
  className,
}: ServerTablePaginationBarProps<TData>) {
  const paginationState = table.getState().pagination
  const currentPage = paginationState.pageIndex + 1
  const totalPages = Math.max(1, table.getPageCount())
  const pageSize = paginationState.pageSize
  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div
      className={cn(
        'border-border bg-card flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3',
        className
      )}
    >
      <div className='flex flex-wrap items-center gap-4'>
        <div className='text-sm'>
          Selected:{' '}
          <span className='font-semibold text-orange-500 dark:text-orange-400'>
            {selectedCount}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Rows per page</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-4'>
        <div className='text-sm font-medium'>
          Page {currentPage} of {totalPages}
        </div>
        <div className='flex items-center gap-1 sm:gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>First page</span>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Previous page</span>
            <ChevronLeft className='h-4 w-4' />
          </Button>

          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? (
                <span className='text-muted-foreground px-1 text-sm'>...</span>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  className={cn(
                    'h-8 min-w-8 px-2',
                    currentPage === pageNumber &&
                      'border-orange-500 bg-orange-500 text-white hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600'
                  )}
                  onClick={() =>
                    table.setPageIndex((pageNumber as number) - 1)
                  }
                >
                  <span className='sr-only'>Page {pageNumber}</span>
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Next page</span>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Last page</span>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
