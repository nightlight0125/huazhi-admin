import React, { useEffect, useMemo, useState } from 'react'
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
import { HelpCircle } from 'lucide-react'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { orderStatuses } from '../data/data'
import { type Order, type OrderProduct } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { OrdersBatchPaymentDialog } from './orders-batch-payment-dialog'
import { createOrdersColumns } from './orders-columns'
import { OrdersEditAddressDialog } from './orders-edit-address-dialog'
import { OrdersEditCustomerNameDialog } from './orders-edit-customer-name-dialog'
import { OrdersModifyProductDialog } from './orders-modify-product-dialog'
import { OrdersTableFooter } from './orders-table-footer'

const route = getRouteApi('/_authenticated/orders/')

type DataTableProps = {
  data: Order[]
  onTableReady?: (table: ReturnType<typeof useReactTable<Order>>) => void
}

function ProductDetailRow({
  product,
  onModifyProduct,
}: {
  product: OrderProduct
  onModifyProduct?: () => void
}) {
  const fieldLabels = ['Shopify', 'SKU', 'Price', 'Quantity']
  const leftButtons = ['Store', 'HZ']
  const rightButtons = [
    { label: 'Modify Product', onClick: onModifyProduct || (() => {}) },
    { label: 'Delete', onClick: () => {} },
  ]

  return (
    <TableRow className='bg-muted/30'>
      <TableCell colSpan={100} className='px-3 py-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-start gap-2'>
            <div>
              <img
                src={product.productImageUrl}
                alt={product.productName}
                className='h-12 w-12 rounded object-cover'
              />
            </div>
            <div className='flex flex-col gap-2'>
              {leftButtons.map((buttonLabel, buttonIndex) => (
                <div key={buttonLabel} className='flex items-center gap-2'>
                  {fieldLabels.map((label, index) => (
                    <React.Fragment key={`${buttonLabel}-${label}`}>
                      {index === 1 && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-5 w-16 text-[11px]'
                        >
                          {buttonLabel}
                        </Button>
                      )}
                      <div
                        style={{ width: '150px', wordBreak: 'break-all' }}
                        className='text-[12px]'
                      >
                        {index === 0
                          ? buttonIndex === 0
                            ? 'Shopify:---'
                            : 'Variant:---'
                          : `${label}:---`}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            {rightButtons.map((button) => (
              <Button
                key={button.label}
                variant='outline'
                size='sm'
                className='h-5 text-[11px]'
                onClick={button.onClick}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function OrdersTable({ data, onTableReady }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    platformOrderStatus: false,
    platformFulfillmentStatus: false,
    store: false,
    logistics: false,
    country: false,
    status: false,
    shippingOrigin: false,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [modifyProductDialog, setModifyProductDialog] = useState<{
    open: boolean
    products: OrderProduct[]
    orderId: string
  }>({
    open: false,
    products: [],
    orderId: '',
  })
  const [editAddressDialog, setEditAddressDialog] = useState<{
    open: boolean
    order: Order | null
  }>({
    open: false,
    order: null,
  })
  const [editCustomerNameDialog, setEditCustomerNameDialog] = useState<{
    open: boolean
    order: Order | null
  }>({
    open: false,
    order: null,
  })
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

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
      { columnId: 'status', searchKey: 'status', type: 'array' },
      {
        columnId: 'platformOrderStatus',
        searchKey: 'platformOrderStatus',
        type: 'array',
      },
      {
        columnId: 'platformFulfillmentStatus',
        searchKey: 'platformFulfillmentStatus',
        type: 'array',
      },
      { columnId: 'store', searchKey: 'store', type: 'array' },
      { columnId: 'logistics', searchKey: 'logistics', type: 'array' },
      {
        columnId: 'shippingOrigin',
        searchKey: 'shippingOrigin',
        type: 'array',
      },
    ],
  })

  // Filter data based on active tab
  const filteredData = data.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

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

  const handleConfirmModify = (updatedProducts: OrderProduct[]) => {
    console.log(
      'Updated products for order:',
      modifyProductDialog.orderId,
      updatedProducts
    )
    setModifyProductDialog({ open: false, products: [], orderId: '' })
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

  const handleConfirmEditAddress = (addressData: {
    customerName: string
    address: string
    address2?: string
    city: string
    country: string
    province?: string
    postalCode: string
    phoneNumber: string
    email?: string
    shippingOrigin: string
  }) => {
    console.log(
      'Updated address for order:',
      editAddressDialog.order?.id,
      addressData
    )
    setEditAddressDialog({ open: false, order: null })
  }

  const handleEditCustomerName = (orderId: string) => {
    const order = data.find((o) => o.id === orderId)
    if (order) {
      setEditCustomerNameDialog({
        open: true,
        order,
      })
    }
  }

  const handleConfirmEditCustomerName = (customerName: string) => {
    console.log(
      'Updated customer name for order:',
      editCustomerNameDialog.order?.id,
      customerName
    )
    setEditCustomerNameDialog({ open: false, order: null })
  }

  const columns = useMemo(
    () =>
      createOrdersColumns({
        onExpand: handleExpand,
        expandedRows,
        onModifyProduct: (orderId) => {
          const order = data.find((o) => o.id === orderId)
          if (order && order.productList && order.productList.length > 0) {
            setModifyProductDialog({
              open: true,
              products: order.productList,
              orderId,
            })
          } else {
            setModifyProductDialog({
              open: true,
              products: [],
              orderId,
            })
          }
        },
        onEditAddress: handleEditAddress,
        onEditCustomerName: handleEditCustomerName,
      }),
    [expandedRows, data]
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
      const customerName = String(row.getValue('customerName')).toLowerCase()
      const country = String(row.getValue('country')).toLowerCase()
      const province = String(row.getValue('province')).toLowerCase()
      const city = String(row.getValue('city')).toLowerCase()
      const phoneNumber = String(row.getValue('phoneNumber')).toLowerCase()
      const email = String(row.getValue('email')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue) ||
        country.includes(searchValue) ||
        province.includes(searchValue) ||
        city.includes(searchValue) ||
        phoneNumber.includes(searchValue) ||
        email.includes(searchValue)
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

  useEffect(() => {
    if (onTableReady) {
      onTableReady(table)
    }
  }, [table, onTableReady])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-7'>
          {orderStatuses.map((status) => (
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
          {/* Total Amount and Batch Payment - positioned at top left */}
          {(() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            const selectedCount = selectedRows.length
            const totalAmount = selectedRows.reduce((sum, row) => {
              return sum + (row.original.totalCost || 0)
            }, 0)

            return (
              <div className='flex items-center justify-start gap-4 border-b bg-white px-4 py-3'>
                <div className='flex flex-col items-start'>
                  <div className='text-sm'>
                    Total Amount:{' '}
                    <span className='font-medium'>
                      {selectedCount > 0 ? `$${totalAmount.toFixed(2)}` : '---'}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-xs text-orange-500'>
                    <HelpCircle className='h-3 w-3' />
                    <span>Referenced amount</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (selectedCount > 0) {
                      setPaymentDialogOpen(true)
                    }
                  }}
                  disabled={selectedCount === 0}
                >
                  Batch Payment
                </Button>
              </div>
            )
          })()}
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
                    const order = row.original
                    const isExpanded = expandedRows.has(row.id)
                    const hasProducts =
                      order.productList && order.productList.length > 0

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
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
                        {isExpanded && hasProducts && (
                          <>
                            {order.productList.map((product) => (
                              <ProductDetailRow
                                key={product.id}
                                product={product}
                                onModifyProduct={() => {
                                  setModifyProductDialog({
                                    open: true,
                                    products: order.productList || [],
                                    orderId: order.id,
                                  })
                                }}
                              />
                            ))}
                          </>
                        )}
                      </React.Fragment>
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

          <OrdersTableFooter table={table} />
        </TabsContent>
      </Tabs>

      <DataTableBulkActions table={table} />

      {/* Modify Product Dialog */}
      <OrdersModifyProductDialog
        open={modifyProductDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setModifyProductDialog({ open: false, products: [], orderId: '' })
          } else {
            setModifyProductDialog({ ...modifyProductDialog, open })
          }
        }}
        products={modifyProductDialog.products}
        onConfirm={handleConfirmModify}
      />

      <OrdersEditAddressDialog
        open={editAddressDialog.open}
        onOpenChange={(open) =>
          setEditAddressDialog({ ...editAddressDialog, open })
        }
        order={editAddressDialog.order}
        onConfirm={handleConfirmEditAddress}
      />

      <OrdersEditCustomerNameDialog
        open={editCustomerNameDialog.open}
        onOpenChange={(open) =>
          setEditCustomerNameDialog({ ...editCustomerNameDialog, open })
        }
        order={editCustomerNameDialog.order}
        onConfirm={handleConfirmEditCustomerName}
      />

      <OrdersBatchPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        selectedOrders={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
      />
    </div>
  )
}
