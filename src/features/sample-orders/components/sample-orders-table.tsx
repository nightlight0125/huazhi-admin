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
import { sampleOrderStatuses } from '../data/data'
import { type SampleOrder } from '../data/schema'
import { SampleOrdersActionsMenu } from './sample-orders-actions-menu'
import { SampleOrdersBulkActions } from './sample-orders-bulk-actions'
import { createSampleOrdersColumns } from './sample-orders-columns'
import { SampleOrdersPayDialog } from './sample-orders-pay-dialog'
import { SampleOrdersTableFooter } from './sample-orders-table-footer'
import { EditAddressDialog, type AddressData } from '@/components/edit-address-dialog'

const route = getRouteApi('/_authenticated/sample-orders/')

type DataTableProps = {
  data: SampleOrder[]
  onTableReady?: (table: ReturnType<typeof useReactTable<SampleOrder>>) => void
}

export function SampleOrdersTable({ data, onTableReady }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    productName: false,
    logistics: false,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<SampleOrder | null>(null)
  const [editAddressDialog, setEditAddressDialog] = useState<{
    open: boolean
    order: SampleOrder | null
  }>({
    open: false,
    order: null,
  })

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
    const order = data.find((o) => o.id === orderId)
    if (order) {
      setEditAddressDialog({
        open: true,
        order,
      })
    }
  }

  const handleConfirmEditAddress = (addressData: AddressData) => {
    console.log(
      'Updated address for order:',
      editAddressDialog.order?.id,
      addressData
    )
    setEditAddressDialog({ open: false, order: null })
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
      createSampleOrdersColumns({
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
        <SampleOrdersActionsMenu />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          {sampleOrderStatuses.map((status) => (
            <TabsTrigger
              key={status.value}
              value={status.value}
              className='data-[state=active]:text-primary px-4 text-sm'
            >
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
                    {headerGroup.headers.map((header) => {
                      return (
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
                      )
                    })}
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

          <SampleOrdersTableFooter table={table} />
        </TabsContent>
      </Tabs>

      <SampleOrdersBulkActions table={table} />

      <SampleOrdersPayDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        order={selectedOrderForPayment}
      />

      <EditAddressDialog
        open={editAddressDialog.open}
        onOpenChange={(open) =>
          setEditAddressDialog({ ...editAddressDialog, open })
        }
        initialData={
          editAddressDialog.order
            ? {
                customerName: editAddressDialog.order.address.name,
                address: editAddressDialog.order.address.address,
                country: editAddressDialog.order.address.country,
              }
            : undefined
        }
        onConfirm={handleConfirmEditAddress}
      />
    </div>
  )
}
