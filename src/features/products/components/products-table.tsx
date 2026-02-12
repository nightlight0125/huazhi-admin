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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { categories, locations, priceRanges } from '../data/data'
import { type Product } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { productsColumns as columns } from './products-columns'
import { ProductsGridView } from './products-grid-view'
import { ProductsViewToggle } from './products-view-toggle'

const route = getRouteApi('/_authenticated/products/' as any)

type DataTableProps = {
  data: Product[]
}

export function ProductsTable({ data }: DataTableProps) {
  // 本地UI状态
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [view, setView] = useState<'list' | 'grid'>('list')

  // 与URL同步的状态
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
    navigate: route.useNavigate() as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'shippingLocation', searchKey: 'location', type: 'array' },
      { columnId: 'category', searchKey: 'category', type: 'array' },
      { columnId: 'price', searchKey: 'priceRange', type: 'array' },
    ],
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
      const id = String(row.getValue('id')).toLowerCase()
      const name = String(row.getValue('name')).toLowerCase()
      const sku = String(row.getValue('sku')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        id.includes(searchValue) ||
        name.includes(searchValue) ||
        sku.includes(searchValue)
      )
    },
    filterFns: {
      priceRange: (row, id, value) => {
        const price = row.getValue(id) as number
        return value.some((range: string) => {
          switch (range) {
            case '0-100':
              return price >= 0 && price <= 100
            case '100-500':
              return price > 100 && price <= 500
            case '500-1000':
              return price > 500 && price <= 1000
            case '1000-5000':
              return price > 1000 && price <= 5000
            case '5000+':
              return price > 5000
            default:
              return false
          }
        })
      },
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
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <div className='flex items-center justify-between'>
        <DataTableToolbar
          table={table}
          searchPlaceholder='按产品名称、SKU或ID搜索...'
          filters={[
            {
              columnId: 'shippingLocation',
              title: '发货地',
              options: locations as any,
            },
            {
              columnId: 'category',
              title: '类别',
              options: categories as any,
            },
            {
              columnId: 'price',
              title: '价格区间',
              options: priceRanges as any,
            },
          ]}
        />
        <ProductsViewToggle view={view} onViewChange={setView} />
      </div>
      
      {view === 'list' ? (
        <>
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
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </>
      ) : (
        <ProductsGridView products={table.getRowModel().rows.map(row => row.original)} />
      )}
      
      <DataTableBulkActions table={table} />
    </div>
  )
}
