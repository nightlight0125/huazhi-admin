import { useEffect, useState } from 'react'
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const referee = String(row.getValue('referee')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return referee.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  })

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      const userId = auth.user?.customerId || auth.user?.id
      if (!userId) {
        setIsLoading(false)
        setData([])
        setTotalCount(0)
        return
      }

      const pageNo = pagination.pageIndex + 1
      const pageSize = pagination.pageSize

      setIsLoading(true)
      try {
        await queryCustomerRecommendList(
          String(userId),
          pageNo,
          pageSize
        )

        // 处理返回的数据：如果 rows 是数组，需要展平 hzkj_recommended_list
        const records: RecommendedListRecord[] = []

        // if (Array.isArray(response.rows)) {
        //   response.rows.forEach((row) => {
        //     if (
        //       row.hzkj_recommended_list &&
        //       Array.isArray(row.hzkj_recommended_list)
        //     ) {
        //       row.hzkj_recommended_list.forEach((item) => {
        //         records.push({
        //           id: String(item.id || ''),
        //           referee: String(item.hzkj_recommended_user_name || '-'),
        //           registrationTime: String(
        //             item.hzkj_recommended_user_createtime || '-'
        //           ),
        //           commissionAmount:
        //             typeof item.hzkj_contribution_amount === 'number'
        //               ? item.hzkj_contribution_amount
        //               : 0,
        //         })
        //       })
        //     }
        //   })
        // }

        setData(records)
        setTotalCount(0)
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
    auth.user?.id,
    auth.user?.customerId,
    pagination.pageIndex,
    pagination.pageSize,
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
            {isLoading ? (
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
                  colSpan={recommendedListColumns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>
      <DataTablePagination table={table} />
      <RecommendedListBulkActions table={table} />
    </div>
  )
}
