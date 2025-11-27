import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { Sparkles } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type HotSellingProduct } from '../data/schema'
import { createHotSellingProductsColumns } from './hot-selling-products-columns'

// Mock data - replace with actual data fetching
const mockData: HotSellingProduct[] = []

export function HotSellingProducts() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date('2025-10-19'),
    to: new Date('2025-10-26'),
  })

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Filter data based on date range
  const filteredData = useMemo(() => {
    let data = [...mockData]

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      // TODO: Filter by date range when date field is added to schema
    }

    return data
  }, [dateRange])

  const columns = createHotSellingProductsColumns()

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const productName = String(row.getValue('productName')).toLowerCase()
      return productName.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    if (pagination.pageIndex >= pageCount && pageCount > 0) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: pageCount - 1,
      }))
    }
  }, [pageCount, pagination.pageIndex])

  return (
    <div className='mt-8'>
      <CardContent className='space-y-4'>
        {/* Filter Panel */}
        <div className='flex flex-wrap items-center gap-4'>
          {/* Date Range */}
          {/* <div className='flex items-center gap-2'>
            <label className='text-sm font-medium whitespace-nowrap'>
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-[280px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'yyyy-MM-dd')} -{' '}
                        {format(dateRange.to, 'yyyy-MM-dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'yyyy-MM-dd')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div> */}

          {/* Store Selector */}
          {/* <div className='flex items-center gap-2'>
            <label className='text-sm font-medium whitespace-nowrap'>
              Store
            </label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select Store Name' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='store1'>Store 1</SelectItem>
                <SelectItem value='store2'>Store 2</SelectItem>
                <SelectItem value='store3'>Store 3</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>
        <div className='text-lg font-bold'>Hot Selling Products</div>

        {/* Table */}
        <div className='space-y-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Search by product name...'
            filters={[
              {
                columnId: 'selectedStore',
                title: 'Select Store Name',
                options: [
                  { value: 'store1', label: 'Store 1' },
                  { value: 'store2', label: 'Store 2' },
                  { value: 'store3', label: 'Store 3' },
                ],
              },
            ]}
            dateRange={{
              enabled: true,
              columnId: 'createdAt',
              onDateRangeChange: setDateRange,
              placeholder: 'Select Date Range',
            }}
          />

          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-[400px]'>
                      <div className='flex h-full flex-col items-center justify-center'>
                        <Sparkles className='text-muted-foreground mb-4 h-12 w-12' />
                        <p className='text-muted-foreground text-sm'>No Data</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {table.getRowModel().rows?.length > 0 && (
            <DataTablePagination table={table} />
          )}
        </div>
      </CardContent>
    </div>
  )
}
