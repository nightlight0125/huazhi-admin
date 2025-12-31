import { useEffect, useState } from 'react'
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
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Logistics } from '../data/schema'
import { EditShippingToDialog } from './edit-shipping-to-dialog'
import { createLogisticsColumns } from './logistics-columns'

type LogisticsTableProps = {
  data: Logistics[]
  search: Record<string, unknown>
  navigate: NavigateFn
  totalCount: number
  onRefresh?: () => void
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
      { columnId: 'shippingFrom', searchKey: 'shippingFrom', type: 'array' },
      { columnId: 'shippingTo', searchKey: 'shippingTo', type: 'array' },
      {
        columnId: 'shippingMethod',
        searchKey: 'shippingMethod',
        type: 'array',
      },
    ],
  })

  const columns = createLogisticsColumns(
    (row) => {
      setEditingRow(row)
    },
    onRefresh
  )

  // 计算总页数
  const pageCount = Math.ceil(totalCount / pagination.pageSize)

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
    manualPagination: true,
    pageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const sku = String(row.getValue('sku')).toLowerCase()
      const shippingFrom = String(row.getValue('shippingFrom')).toLowerCase()
      const shippingTo = String(row.getValue('shippingTo')).toLowerCase()
      const shippingMethod = String(
        row.getValue('shippingMethod')
      ).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        sku.includes(searchValue) ||
        shippingFrom.includes(searchValue) ||
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
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='please Enter SPU or Shipping From or Shipping To or Shipping Method'
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  暂无数据
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
                  暂无数据
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
          // notify parent to refresh if provided
          onRefresh?.()
        }}
      />
    </div>
  )
}
