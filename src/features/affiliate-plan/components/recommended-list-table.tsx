import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryCustomerRecommendList } from '@/lib/api/users'
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type RecommendedListRecord } from '../data/schema'
import { RecommendedListBulkActions } from './recommended-list-bulk-actions'
import { recommendedListColumns } from './recommended-list-columns'

export function RecommendedListTable() {
  const { auth } = useAuthStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<RecommendedListRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // 格式化日期范围
  const formattedDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return {
        startDate: format(dateRange.from, 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(dateRange.to, 'yyyy-MM-dd HH:mm:ss'),
      }
    }
    return undefined
  }, [dateRange])

  // 检查日期范围是否完整
  const isDateRangeComplete = useMemo(() => {
    return !!(dateRange?.from && dateRange?.to)
  }, [dateRange])

  // 将 API 返回的数据映射为 RecommendedListRecord 格式
  const mapToRecommendedListRecord = (
    item: any,
    index: number
  ): RecommendedListRecord => {
    return {
      id: item.id || `recommend-${index}-${item.Referee || ''}`,
      referee: item.Referee || '',
      registrationTime: item.RegistrationTime || '',
      commissionAmount: item.CommissionAmount || 0,
    }
  }

  const table = useReactTable({
    data,
    columns: recommendedListColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (row: any, index: number) => {
      // row 是 Row 对象，需要通过 row.original 访问原始数据
      const id = row.original?.id || `row-${index}`
      return id
    },
    // 服务端分页时，禁用客户端过滤和排序
    globalFilterFn: () => true, // 始终返回 true，不过滤数据
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true, // 禁用客户端过滤
    manualSorting: true, // 禁用客户端排序
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  })

  useEffect(() => {
    if (formattedDateRange) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [formattedDateRange])

  useEffect(() => {
    const fetchData = async () => {
      const customerId = auth.user?.customerId

      if (dateRange && !isDateRangeComplete) {
        return
      }

      const pageIndex = pagination.pageIndex + 1
      const pageSize = pagination.pageSize
      setIsLoading(true)
      try {
        const response = await queryCustomerRecommendList(
          String(customerId),
          pageIndex,
          pageSize,
          formattedDateRange
            ? {
                startDate: formattedDateRange.startDate,
                endDate: formattedDateRange.endDate,
              }
            : undefined
        )

        const mappedData = response.rows.map((item, index) =>
          mapToRecommendedListRecord(item, index)
        )

        // 使用函数式更新确保状态正确更新
        setData(() => {
          return mappedData
        })
        setTotalCount(() => {
          return response.totalCount
        })
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load recommended list. Please try again.'
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
    pagination.pageIndex,
    pagination.pageSize,
    formattedDateRange,
    isDateRangeComplete,
    dateRange,
  ])

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        showSearch={false}
        showSearchButton={false}
        dateRange={{
          enabled: true,
          columnId: 'registrationTime',
          placeholder: 'Pick a date range',
          onDateRangeChange: setDateRange,
        }}
      />

      <div className='rounded-md border'>
        <TableComponent>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              const rows = table.getRowModel().rows
              if (isLoading) {
                return (
                  <TableRow>
                    <TableCell
                      colSpan={recommendedListColumns.length}
                      className='h-24 text-center'
                    >
                      <div className='flex items-center justify-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }

              if (rows?.length) {
                return rows.map((row) => (
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
              }

              return (
                <TableRow>
                  <TableCell
                    colSpan={recommendedListColumns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )
            })()}
          </TableBody>
        </TableComponent>
      </div>
      <DataTablePagination table={table} />
      <RecommendedListBulkActions table={table} />
    </div>
  )
}
