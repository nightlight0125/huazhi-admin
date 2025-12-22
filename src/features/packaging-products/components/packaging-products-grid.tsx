import { useEffect, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  type ColumnDef,
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
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type PackagingProduct } from '../data/schema'

const route = getRouteApi('/_authenticated/packaging-products/')

type PackagingProductsGridProps = {
  data: PackagingProduct[]
  tab?: 'packaging-products' | 'my-packaging'
}

const categoryFilters = [
  { value: 'paper-boxes', label: 'Paper boxes' },
  { value: 'plastic-boxes', label: 'Plastic boxes' },
  { value: 'leather-boxes', label: 'Leather boxes' },
  { value: 'wooden-boxes', label: 'Wooden boxes' },
  { value: 'bamboo-boxes', label: 'Bamboo boxes' },
  { value: 'cartons', label: 'Cartons' },
  { value: 'card', label: 'Card' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'shipping-bag', label: 'Shipping bag' },
  { value: 'ziplock-bag', label: 'Ziplock bag' },
]

// Create a minimal column definition for the table
const columns: ColumnDef<PackagingProduct>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    enableHiding: true,
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return true
      }
      return value.includes(row.getValue(id))
    },
  },
]

export function PackagingProductsGrid({ data, tab = 'packaging-products' }: PackagingProductsGridProps) {
  const nav = useNavigate()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
    pagination: { defaultPage: 1, defaultPageSize: 18 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'category', searchKey: 'category', type: 'array' },
    ],
  })

  // Category filter is now handled by table columnFilters, so we use data directly
  const categoryFilteredData = data

  // Create real table instance for toolbar and pagination
  const table = useReactTable({
    data: categoryFilteredData,
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
      const name = String(row.original.name || '').toLowerCase()
      const sku = String(row.original.sku || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return name.includes(searchValue) || sku.includes(searchValue)
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
        searchPlaceholder='SKU/Product Name'
        filters={[
          {
            columnId: 'category',
            title: 'Category',
            options: categoryFilters.map((f) => ({
              label: f.label,
              value: f.value,
            })),
          },
        ]}
      />
      {/* Product Grid */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'>
        {table.getRowModel().rows.map((row) => {
          const product = row.original
          const from =
            tab === 'my-packaging'
              ? 'packaging-products-my'
              : 'packaging-products'
          return (
            <div
              key={product.id}
              className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
              onClick={() =>
                nav({
                  to: '/products/$productId',
                  params: { productId: product.id },
                  search: { from },
                })
              }
            >
              {/* Product Image */}
              <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
              </div>

              {/* Product Info */}
              <div className='space-y-1.5 p-2.5'>
                {/* Sizes */}
                <div className='mb-1 flex flex-wrap gap-1'>
                  {product.sizes.map((size, index) => (
                    <span
                      key={size.value}
                      className='text-muted-foreground text-[10px]'
                    >
                      {size.label}
                      {index < product.sizes.length - 1 && ','}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className='text-base font-bold'>
                  ${product.price.toFixed(2)}
                </div>

                {/* Description */}
                <p className='text-muted-foreground line-clamp-2 text-xs leading-tight'>
                  {product.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className='text-muted-foreground flex h-24 items-center justify-center'>
          No products found.
        </div>
      )}

      <DataTablePagination table={table} />
    </div>
  )
}
