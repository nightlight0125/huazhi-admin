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
import { type StoreProduct } from '../data/schema'
import { ConnectProductsConfirmDialog } from './connect-products-confirm-dialog'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { ProductsConnectionDialog } from './products-connection-dialog'
import { createStoreProductsColumns } from './store-products-columns'

const route = getRouteApi('/_authenticated/store-products/')

type DataTableProps = {
  data: StoreProduct[]
}

export function StoreProductsTable({ data }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    associateStatus: false,
  })
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)

  // Synced with URL states (updated to match route search schema defaults)
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
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  const handleConnectProducts = (_productId: string) => {
    setConnectDialogOpen(true)
  }

  const handleConfirmConnect = () => {
    setConnectDialogOpen(false)
    // 不在这里关闭，让确认对话框打开连接对话框
  }

  const handleOpenConnectionDialog = () => {
    setConnectionDialogOpen(true)
  }

  const handleConnectionConfirm = (
    connections: Array<{ storeProductId: string; teemDropProductId: string }>
  ) => {
    console.log('Product connections:', connections)
    // TODO: 实现连接产品的逻辑
    setConnectionDialogOpen(false)
  }

  const columns = createStoreProductsColumns({
    onConnectProducts: handleConnectProducts,
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
      const searchValue = String(filterValue).toLowerCase()

      return id.includes(searchValue) || name.includes(searchValue)
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
      <DataTableToolbar
        table={table}
        searchPlaceholder='Product Name'
        searchKey='name'
        filters={[
          {
            columnId: 'storeName',
            title: 'Select Shop',
            options: [
              { label: 'Shop 1', value: 'Shop 1' },
              { label: 'Shop 2', value: 'Shop 2' },
              { label: 'Shop 3', value: 'Shop 3' },
            ],
          },
          // {
          //   columnId: 'associateStatus',
          //   title: 'Associate Status',
          //   options: [
          //     { label: 'Associated', value: 'associated' },
          //     { label: 'Not Associated', value: 'not-associated' },
          //   ],
          // },
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className='text-xs font-medium'
                    >
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
                  className='text-xs'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-2'>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
      <ConnectProductsConfirmDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        onConfirm={handleConfirmConnect}
        onOpenConnectionDialog={handleOpenConnectionDialog}
      />
      <ProductsConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        onConfirm={handleConnectionConfirm}
      />
    </div>
  )
}
