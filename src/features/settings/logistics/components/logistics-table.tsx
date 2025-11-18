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
import { DataTablePagination } from '@/components/data-table'
import { type Logistics } from '../data/schema'
import { createLogisticsColumns } from './logistics-columns'
import { LogisticsToolbar } from './logistics-toolbar'

const route = getRouteApi('/_authenticated/settings/logistics')

type LogisticsTableProps = {
  data: Logistics[]
}

export function LogisticsTable({ data }: LogisticsTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
      { columnId: 'shippingMethod', searchKey: 'shippingMethod', type: 'array' },
    ],
  })

  const columns = createLogisticsColumns()

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
      const shippingMethod = String(row.getValue('shippingMethod')).toLowerCase()
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

  const handleSearch = (filters: {
    sku?: string
    shippingFrom?: string
    shippingTo?: string
    shippingMethod?: string
  }) => {
    // Apply global filter for text search
    const globalSearchValue =
      filters.sku || filters.shippingFrom || filters.shippingTo || filters.shippingMethod
    table.setGlobalFilter(globalSearchValue || '')

    // Apply column filters for specific fields
    const newColumnFilters = []
    if (filters.shippingFrom) {
      newColumnFilters.push({ id: 'shippingFrom', value: filters.shippingFrom })
    }
    if (filters.shippingTo) {
      newColumnFilters.push({ id: 'shippingTo', value: filters.shippingTo })
    }
    if (filters.shippingMethod) {
      newColumnFilters.push({ id: 'shippingMethod', value: filters.shippingMethod })
    }
    table.setColumnFilters(newColumnFilters)
  }

  const handleReset = () => {
    table.resetColumnFilters()
    table.setGlobalFilter('')
  }

  return (
    <div className='space-y-4'>
      <LogisticsToolbar onSearch={handleSearch} onReset={handleReset} />

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
    </div>
  )
}

