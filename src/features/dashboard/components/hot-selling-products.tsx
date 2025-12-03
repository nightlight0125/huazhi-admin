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
import { HotSellingProductsBulkActions } from './hot-selling-products-bulk-actions'
import { createHotSellingProductsColumns } from './hot-selling-products-columns'

// Mock data - replace with actual data fetching
const mockData: HotSellingProduct[] = [
  {
    id: '1',
    ranking: 1,
    productName: 'Wireless Bluetooth Headphones Pro',
    quantity: 1250,
    sellingAmount: 18750.0,
  },
  {
    id: '2',
    ranking: 2,
    productName: 'Smart Watch Series 9',
    quantity: 980,
    sellingAmount: 14700.0,
  },
  {
    id: '3',
    ranking: 3,
    productName: 'Portable Power Bank 20000mAh',
    quantity: 1560,
    sellingAmount: 12480.0,
  },
  {
    id: '4',
    ranking: 4,
    productName: 'USB-C Fast Charging Cable Set',
    quantity: 2100,
    sellingAmount: 10500.0,
  },
  {
    id: '5',
    ranking: 5,
    productName: 'LED Desk Lamp with Wireless Charger',
    quantity: 750,
    sellingAmount: 11250.0,
  },
  {
    id: '6',
    ranking: 6,
    productName: 'Mechanical Keyboard RGB',
    quantity: 680,
    sellingAmount: 10200.0,
  },
  {
    id: '7',
    ranking: 7,
    productName: 'Wireless Mouse Ergonomic',
    quantity: 920,
    sellingAmount: 9200.0,
  },
  {
    id: '8',
    ranking: 8,
    productName: 'Laptop Stand Aluminum',
    quantity: 540,
    sellingAmount: 8100.0,
  },
  {
    id: '9',
    ranking: 9,
    productName: 'Phone Case with Stand',
    quantity: 1100,
    sellingAmount: 7700.0,
  },
  {
    id: '10',
    ranking: 10,
    productName: 'Screen Protector Tempered Glass',
    quantity: 1850,
    sellingAmount: 7400.0,
  },
  {
    id: '11',
    ranking: 11,
    productName: 'Webcam HD 1080p',
    quantity: 420,
    sellingAmount: 6300.0,
  },
  {
    id: '12',
    ranking: 12,
    productName: 'USB Hub 4-Port',
    quantity: 890,
    sellingAmount: 5340.0,
  },
  {
    id: '13',
    ranking: 13,
    productName: 'Laptop Cooling Pad',
    quantity: 650,
    sellingAmount: 5200.0,
  },
  {
    id: '14',
    ranking: 14,
    productName: 'Wireless Earbuds Sport',
    quantity: 720,
    sellingAmount: 5040.0,
  },
  {
    id: '15',
    ranking: 15,
    productName: 'Tablet Stand Adjustable',
    quantity: 380,
    sellingAmount: 4560.0,
  },
]

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
    enableRowSelection: true,
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
        <div className='flex flex-wrap items-center gap-4'></div>
        <div className='text-lg font-bold'>Hot Selling Products</div>

        <div className='space-y-4'>
          <DataTableToolbar
            table={table}
            showSearch={false}
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
          <HotSellingProductsBulkActions table={table} />
        </div>
      </CardContent>
    </div>
  )
}
