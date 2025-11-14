import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  type SortingState,
  type Table as TanstackTable,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { type PackagingProduct, type StoreSku } from '../data/schema'
import { createPackagingConnectionColumns } from './packaging-connection-columns'

type DataTableProps = {
  data: StoreSku[]
  table?: TanstackTable<StoreSku>
  expandedRows?: Set<string>
  onExpand?: (rowId: string) => void
}

export function PackagingConnectionTable({
  data,
  table: externalTable,
  expandedRows: externalExpandedRows,
  onExpand: externalOnExpand,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalExpandedRows, setInternalExpandedRows] = useState<Set<string>>(
    new Set()
  )
  const [globalFilter, setGlobalFilter] = useState('')

  // Use external expandedRows if provided, otherwise use internal state
  const expandedRows = externalExpandedRows ?? internalExpandedRows

  const handleExpand = (rowId: string) => {
    if (externalOnExpand) {
      externalOnExpand(rowId)
    } else {
      setInternalExpandedRows((prev) => {
        const next = new Set(prev)
        if (next.has(rowId)) {
          next.delete(rowId)
        } else {
          next.add(rowId)
        }
        return next
      })
    }
  }

  const handleDisconnect = (storeSku: StoreSku) => {
    console.log('Disconnect:', storeSku)
    // TODO: Implement disconnect logic
  }

  const handleConnect = (storeSku: StoreSku) => {
    console.log('Connect:', storeSku)
    // TODO: Implement connect logic
  }

  // Get status filter from external table if provided
  const statusFilter = externalTable
    ?.getState()
    .columnFilters.find((f) => f.id === 'status')?.value as string[] | undefined
  const isConnectedFilter =
    statusFilter?.includes('connected') && statusFilter.length === 1

  // Create columns based on filter state (only used if no external table)
  const columns = useMemo(() => {
    return createPackagingConnectionColumns({
      onExpand: handleExpand,
      expandedRows,
      onDisconnect: handleDisconnect,
      onConnect: handleConnect,
      isConnectedFilter: isConnectedFilter ?? false,
    })
  }, [
    handleExpand,
    expandedRows,
    handleDisconnect,
    handleConnect,
    isConnectedFilter,
  ])

  // Only create internal table if no external table provided
  const [columnFilters, setColumnFilters] = useState<
    Array<{ id: string; value: unknown }>
  >([])
  const internalTable = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const item = row.original
      return (
        item.name.toLowerCase().includes(searchValue) ||
        item.sku.toLowerCase().includes(searchValue) ||
        item.storeName.toLowerCase().includes(searchValue) ||
        (item.hzProductSku?.toLowerCase().includes(searchValue) ?? false)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
  })

  const table = externalTable || internalTable

  return (
    <div className='space-y-4'>
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
              table.getRowModel().rows.map((row) => {
                const item = row.original
                const isExpanded = expandedRows.has(row.id)
                const hasPackagingProducts =
                  item.packagingProducts && item.packagingProducts.length > 0

                return (
                  <>
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
                    {isExpanded && hasPackagingProducts && (
                      <TableRow
                        key={`${row.id}-expanded`}
                        className='bg-muted/30'
                      >
                        <TableCell colSpan={columns.length} className='p-0'>
                          <div className='bg-background border-t p-4'>
                            <div className='bg-background overflow-hidden rounded-md'>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className='w-[400px]'>
                                      Packaging Products
                                    </TableHead>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Related Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {item.packagingProducts?.map(
                                    (pkg: PackagingProduct) => (
                                      <TableRow
                                        key={pkg.id}
                                        className='hover:bg-muted/50'
                                      >
                                        <TableCell>
                                          <div className='flex items-center gap-3'>
                                            <div className='bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border'>
                                              <img
                                                src={pkg.image}
                                                alt={pkg.name}
                                                className='h-full w-full object-cover'
                                                onError={(e) => {
                                                  const target =
                                                    e.target as HTMLImageElement
                                                  target.src =
                                                    '/placeholder-image.png'
                                                }}
                                              />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                              <div className='line-clamp-2 text-sm font-medium'>
                                                {pkg.name}
                                              </div>
                                              <div className='text-muted-foreground text-xs'>
                                                SKU: {pkg.sku}
                                              </div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className='text-foreground text-sm'>
                                            {pkg.variant}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className='text-foreground text-sm font-medium'>
                                            ${pkg.price.toFixed(2)}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className='text-muted-foreground text-sm'>
                                            {format(
                                              pkg.relatedTime,
                                              'MMM. dd, yyyy HH:mm:ss'
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
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
    </div>
  )
}

// Export hook to create table in parent component
export function usePackagingConnectionTable(
  data: StoreSku[],
  options?: {
    onConnect?: (storeSku: StoreSku) => void
    onDisconnect?: (storeSku: StoreSku) => void
  }
) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<
    Array<{ id: string; value: unknown }>
  >([])

  const handleExpand = (rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  const handleDisconnect = (storeSku: StoreSku) => {
    options?.onDisconnect?.(storeSku)
  }

  const handleConnect = (storeSku: StoreSku) => {
    options?.onConnect?.(storeSku)
  }

  // Get status filter value from columnFilters
  const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as
    | string[]
    | undefined
  const isConnectedFilter =
    statusFilter?.includes('connected') && statusFilter.length === 1

  // Create columns based on filter state
  const columns = useMemo(() => {
    return createPackagingConnectionColumns({
      onExpand: handleExpand,
      expandedRows,
      onDisconnect: handleDisconnect,
      onConnect: handleConnect,
      isConnectedFilter,
    })
  }, [
    handleExpand,
    expandedRows,
    handleDisconnect,
    handleConnect,
    isConnectedFilter,
  ])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const item = row.original
      return (
        item.name.toLowerCase().includes(searchValue) ||
        item.sku.toLowerCase().includes(searchValue) ||
        item.storeName.toLowerCase().includes(searchValue) ||
        (item.hzProductSku?.toLowerCase().includes(searchValue) ?? false)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
  })

  return {
    table,
    expandedRows,
    handleExpand,
  }
}
