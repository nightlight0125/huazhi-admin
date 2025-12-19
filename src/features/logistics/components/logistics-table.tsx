import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
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

const route = getRouteApi('/_authenticated/logistics/')

type LogisticsTableProps = {
  data: Logistics[]
}

export function LogisticsTable({ data }: LogisticsTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [editingRow, setEditingRow] = useState<Logistics | null>(null)

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
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

  const columns = createLogisticsColumns((row) => {
    setEditingRow(row)
  })

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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='please Enter SPU or Shipping From or Shipping To or Shipping Method'
        // extraSearch={{
        //   columnId: 'shippingFrom',
        //   placeholder: 'please Enter Shipping From',
        // }}
        // extraSearch2={{
        //   columnId: 'shippingTo',
        //   placeholder: 'please Enter Shipping To',
        // }}
        // extraSearch3={{
        //   columnId: 'shippingMethod',
        //   placeholder: 'please Enter Shipping Method',
        // }}
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
        onSubmit={(row, values) => {
          // TODO: 接入实际更新逻辑（如调用接口并刷新数据）
          // 这里只做一个简单的日志，方便后续接入
          // eslint-disable-next-line no-console
          console.log(
            'Update shipping info for row:',
            row.id,
            'shippingTo =>',
            values.shippingTo,
            'shippingMethod =>',
            values.shippingMethod
          )
        }}
      />
    </div>
  )
}
