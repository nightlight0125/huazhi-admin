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
import { queryCustomerTrace, type CustomerTraceItem } from '@/lib/api/users'
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type WithdrawRecord } from '../data/schema'
import { WithdrawRecordsBulkActions } from './withdraw-records-bulk-actions'
import { withdrawRecordsColumns } from './withdraw-records-columns'

interface WithdrawRecordsTableProps {
  data?: WithdrawRecord[]
}

export function WithdrawRecordsTable({
  data: _data,
}: WithdrawRecordsTableProps) {
  const { auth } = useAuthStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [tableData, setTableData] = useState<WithdrawRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // 格式化日期范围
  const formattedDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      // 开始日期使用当天的 00:00:00
      const startDate = new Date(dateRange.from)
      startDate.setHours(0, 0, 0, 0)

      // 结束日期使用当天的 23:59:59
      const endDate = new Date(dateRange.to)
      endDate.setHours(23, 59, 59, 999)

      return {
        startDate: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
      }
    }
    return undefined
  }, [dateRange])

  // 将后端数据映射为 WithdrawRecord 格式
  const mapTraceToWithdrawRecord = (
    item: CustomerTraceItem
  ): WithdrawRecord => {
    return {
      id: item.id || '',
      account: item.hzkj_email || item.number || '',
      accountType: item.hzkj_src_type_title || item.hzkj_type_title || '',
      amount: 0, // 后端数据中没有金额字段，设为0
      dateTime: new Date(), // 后端数据中没有日期字段，使用当前日期
      status: item.status_title || item.status || '',
      remarks: item.hzkj_src_channel_name || undefined,
    }
  }

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.user?.customerId) {
        return
      }

      setIsLoading(true)
      try {
        const result = await queryCustomerTrace(
          String(auth.user.customerId),
          pagination.pageIndex + 1,
          pagination.pageSize,
          formattedDateRange?.startDate,
          formattedDateRange?.endDate
        )

        const mappedData = result.rows.map(mapTraceToWithdrawRecord)
        setTableData(mappedData)
        setTotalCount(result.totalCount)
      } catch (error) {
        console.error('Failed to fetch withdraw records:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to fetch withdraw records. Please try again.'
        )
        setTableData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [
    auth.user?.id,
    pagination.pageIndex,
    pagination.pageSize,
    formattedDateRange?.startDate,
    formattedDateRange?.endDate,
  ])

  const table = useReactTable({
    data: tableData,
    columns: withdrawRecordsColumns,
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
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    globalFilterFn: (row, _columnId, filterValue) => {
      const account = String(row.getValue('account')).toLowerCase()
      const accountType = String(row.getValue('accountType')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return account.includes(searchValue) || accountType.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        showSearch={false}
        showSearchButton={false}
        dateRange={{
          enabled: true,
          columnId: 'dateTime',
          placeholder: 'Pick a date range',
          onDateRangeChange: (range) => {
            setDateRange(range)
            // 重置到第一页
            setPagination((prev) => ({ ...prev, pageIndex: 0 }))
          },
        }}
      />

      {/* Table */}
      <div className='rounded-md border'>
        <TableComponent>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className=''>
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={withdrawRecordsColumns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Loading...</span>
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
                <TableCell
                  colSpan={withdrawRecordsColumns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      {/* Bulk Actions */}
      <WithdrawRecordsBulkActions table={table} />
    </div>
  )
}
