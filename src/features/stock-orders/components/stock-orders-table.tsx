import { useEffect, useMemo, useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { stockOrderStatuses } from '../data/data'
import { type StockOrder } from '../data/schema'
import { StockOrdersActionsMenu } from './stock-orders-actions-menu'
import { StockOrdersBulkActions } from './stock-orders-bulk-actions'
import { createStockOrdersColumns } from './stock-orders-columns'
import { StockOrdersPayDialog } from './stock-orders-pay-dialog'
import { StockOrdersTableFooter } from './stock-orders-table-footer'

const route = getRouteApi('/_authenticated/stock-orders/')

type DataTableProps = {
  data: StockOrder[]
  onTableReady?: (table: ReturnType<typeof useReactTable<StockOrder>>) => void
}

export function StockOrdersTable({ data, onTableReady }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    productName: false,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<StockOrder | null>(null)

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
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  // Filter data based on active tab
  const filteredData = data.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  const handlePay = (orderId: string) => {
    const order = data.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrderForPayment(order)
      setPayDialogOpen(true)
    }
  }

  const handleEditAddress = (orderId: string) => {
    console.log('Edit address for order:', orderId)
    // TODO: Implement edit address logic
  }

  const handleAddPackage = (orderId: string) => {
    console.log('Add package for order:', orderId)
    // TODO: Implement add package logic
  }

  const handleDelete = (orderId: string) => {
    console.log('Delete order:', orderId)
    // TODO: Implement delete logic
  }

  const columns = useMemo(
    () =>
      createStockOrdersColumns({
        onPay: handlePay,
        onEditAddress: handleEditAddress,
        onAddPackage: handleAddPackage,
        onDelete: handleDelete,
      }),
    []
  )

  const table = useReactTable({
    data: filteredData,
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
      const orderNumber = String(row.getValue('orderNumber')).toLowerCase()
      const sku = String(row.original.sku).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return orderNumber.includes(searchValue) || sku.includes(searchValue)
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

  // Notify parent component when table is ready
  useEffect(() => {
    if (onTableReady) {
      onTableReady(table)
    }
  }, [table, onTableReady])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <div className='mb-2 flex items-center justify-end'>
        <StockOrdersActionsMenu />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          {stockOrderStatuses.map((status) => (
            <TabsTrigger key={status.value} value={status.value}>
              {status.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className='space-y-4'>
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : typeof header.column
                            .columnDef.header === 'string' ? (
                          <div className='whitespace-pre-line'>
                            {header.column.columnDef.header}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    return (
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

          <StockOrdersTableFooter table={table} />
        </TabsContent>
      </Tabs>

      <StockOrdersBulkActions table={table} />

      <StockOrdersPayDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        order={selectedOrderForPayment}
      />
    </div>
  )
}
