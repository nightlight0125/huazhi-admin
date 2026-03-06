import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from '@/components/ui/table'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useEffect, useState } from 'react'
import { type Logistics } from '../data/schema'
import { EditShippingToDialog } from './edit-shipping-to-dialog'
import { createLogisticsColumns } from './logistics-columns'

type LogisticsTableProps = {
  data: Logistics[]
  search: Record<string, unknown>
  navigate: NavigateFn
  totalCount: number
  // 可选刷新回调（目前用于编辑地址后从服务端重新拉取数据）
  onRefresh?: (forceRefresh?: boolean) => void
}

export function LogisticsTable({
  data,
  search,
  navigate,
  totalCount,
  onRefresh,
}: LogisticsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  // 本地维护一份可编辑的数据副本，用于删除后的局部刷新
  const [tableData, setTableData] = useState<Logistics[]>(data)
  const [editingRow, setEditingRow] = useState<Logistics | null>(null)

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'shippingTo', searchKey: 'shippingTo', type: 'array' },
      {
        columnId: 'shippingMethod',
        searchKey: 'shippingMethod',
        type: 'array',
      },
    ],
  })

  // 当父组件的数据变更时，同步更新本地副本
  useEffect(() => {
    setTableData(data)
  }, [data])

  const columns = createLogisticsColumns(
    (row) => {
      setEditingRow(row)
    },
    (deletedRow) => {
      // 仅在当前页本地删除该行，避免整页刷新
      setTableData((prev) => prev.filter((item) => item.id !== deletedRow.id))
    }
  )

  // 计算总页数
  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  const table = useReactTable({
    data: tableData,
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
    manualPagination: true,
    pageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const sku = String(row.getValue('sku') || '').toLowerCase()
      const shippingTo = String(row.getValue('shippingTo') || '').toLowerCase()
      const shippingMethod = String(row.getValue('shippingMethod') || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        sku.includes(searchValue) ||
        shippingTo.includes(searchValue) ||
        shippingMethod.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  useEffect(() => {
    // 只在 pageCount 变化且大于 0 时才调用 ensurePageInRange
    // 避免在初始加载时触发不必要的导航
    if (pageCount > 0) {
      ensurePageInRange(pageCount)
    }
  }, [pageCount, ensurePageInRange])

  // 处理搜索，确保只触发一次请求
  const handleSearch = useCallback(
    (searchValue: string) => {
      if (onGlobalFilterChange) {
        onGlobalFilterChange(searchValue)
      }
    },
    [onGlobalFilterChange]
  )

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='please Enter SPU or Shipping From or Shipping To or Shipping Method'
        showSearchButton={true}
        onSearch={handleSearch}
      />
      <div className='overflow-hidden rounded-md border'>
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
            {tableData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No data
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
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      <DataTablePagination table={table} />

      <EditShippingToDialog
        open={!!editingRow}
        row={editingRow}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRow(null)
          }
        }}
        onSubmit={() => {
          // 通知父组件刷新列表，并强制刷新以忽略去重逻辑
          onRefresh?.(true)
        }}
      />
    </div>
  )
}
