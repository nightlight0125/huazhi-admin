import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { Loader2, Sparkles } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { hotProductStatistics } from '@/lib/api/orders'
import { getUserShopOptions, type ShopOption } from '@/lib/utils/shop-utils'
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

export function HotSellingProducts() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<HotSellingProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [shopOptions, setShopOptions] = useState<ShopOption[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

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

  // 获取选中的店铺ID
  const selectedShopId = useMemo(() => {
    const storeFilter = columnFilters.find(
      (filter) => filter.id === 'selectedStore'
    )
    if (
      storeFilter &&
      Array.isArray(storeFilter.value) &&
      storeFilter.value.length > 0
    ) {
      return storeFilter.value[0] as string
    }
    return undefined
  }, [columnFilters])

  const formattedDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return {
        startDate: format(dateRange.from, 'yyyy-MM-dd 00:00:00'),
        endDate: format(dateRange.to, 'yyyy-MM-dd 23:59:59'),
      }
    }
    return undefined
  }, [dateRange])

  const isDateRangeComplete = useMemo(() => {
    return !!(dateRange?.from && dateRange?.to)
  }, [dateRange])

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId || auth.user?.id
      if (!customerId) {
        return
      }

      if (dateRange && !isDateRangeComplete) {
        return
      }

      setIsLoading(true)
      try {
        const result = await hotProductStatistics(
          String(customerId),
          pagination.pageIndex,
          pagination.pageSize,
          selectedShopId,
          formattedDateRange?.startDate,
          formattedDateRange?.endDate
        )

        const mappedData: HotSellingProduct[] = result.rows.map(
          (item, index) => ({
            id: item.skuNumber || String(index + 1),
            ranking: pagination.pageIndex * pagination.pageSize + index + 1,
            productName: item.productName || '-',
            quantity: item.totalQty || 0,
            sellingAmount: item.totalAmount || 0,
          })
        )

        setData(mappedData)
        setTotalCount(result.total)
      } catch (error) {
        console.error('Failed to fetch hot product statistics:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load hot product statistics. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [
    auth.user?.customerId,
    auth.user?.id,
    pagination.pageIndex,
    pagination.pageSize,
    selectedShopId,
    formattedDateRange,
  ])

  useEffect(() => {
    if (selectedShopId !== undefined || formattedDateRange) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [selectedShopId, formattedDateRange])

  // 获取店铺列表
  useEffect(() => {
    const fetchShopOptions = async () => {
      const userId = auth.user?.id
      if (!userId) {
        return
      }

      try {
        const options = await getUserShopOptions(userId, 0, 100)
        setShopOptions(options)
      } catch (error) {
        console.error('Failed to fetch shop options:', error)
        setShopOptions([])
      }
    }

    void fetchShopOptions()
  }, [auth.user?.id])

  const columns = createHotSellingProductsColumns()

  const table = useReactTable({
    data,
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
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const productName = String(row.getValue('productName')).toLowerCase()
      return productName.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
  })

  return (
    <div className='mt-8'>
      <CardContent className='space-y-4'>
        <div className='flex flex-wrap items-center gap-4'></div>
        <div className='text-lg font-bold'>Store Selling Products</div>

        <div className='space-y-4'>
          <DataTableToolbar
            table={table}
            showSearch={false}
            filters={[
              {
                columnId: 'selectedStore',
                title: 'Select Store Name',
                options: shopOptions,
                singleSelect: true,
              },
            ]}
            dateRange={{
              enabled: true,
              columnId: 'createdAt',
              placeholder: 'Select Date Range',
              onDateRangeChange: setDateRange,
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-[400px]'>
                      <div className='flex h-full flex-col items-center justify-center'>
                        <Loader2 className='text-muted-foreground mb-4 h-12 w-12 animate-spin' />
                        <p className='text-muted-foreground text-sm'>
                          Loading...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
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
