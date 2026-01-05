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
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryOrder, deleteOrder } from '@/lib/api/orders'
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
import { sampleOrderStatuses } from '../data/data'
import { type SampleOrder } from '../data/schema'
import { SampleOrdersActionsMenu } from './sample-orders-actions-menu'
import { SampleOrdersBulkActions } from './sample-orders-bulk-actions'
import { createSampleOrdersColumns } from './sample-orders-columns'
import { OrderPayDialog, type OrderPayable } from '@/components/order-pay-dialog'
import { SampleOrdersTableFooter } from './sample-orders-table-footer'
import { EditAddressDialog, type AddressData } from '@/components/edit-address-dialog'

const route = getRouteApi('/_authenticated/sample-orders/')

type DataTableProps = {
  data?: SampleOrder[] // 改为可选，因为现在从 API 获取
  onTableReady?: (table: ReturnType<typeof useReactTable<SampleOrder>>) => void
}

export function SampleOrdersTable({ data: _data, onTableReady }: DataTableProps) {
  const { auth } = useAuthStore()
  const [data, setData] = useState<SampleOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
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
    useState<OrderPayable | null>(null)
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

  // 获取订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      const customerId = auth.user?.customerId
      if (!customerId) {
        setIsLoading(false)
        setData([])
        setTotalCount(0)
        return
      }

      // pagination.pageIndex 是从 0 开始的，API 的 pageIndex 也是从 0 开始
      const pageIndex = pagination.pageIndex
      const pageSize = pagination.pageSize

      setIsLoading(true)
      try {
        const response = await queryOrder({
          customerId: String(customerId),
          type: 'hzkj_orders_BT_Sample',
          str: globalFilter || '',
          pageIndex,
          pageSize,
        })

        // 将 Order 转换为 SampleOrder
        const sampleOrders: SampleOrder[] = response.orders.map((order) => {
          const firstProduct = order.productList[0]
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            sku: firstProduct?.id || '',
            createdAt: order.createdAt,
            cost: {
              total: order.totalCost,
              product: order.productList.reduce((sum, p) => sum + p.totalPrice, 0),
              shipping: order.shippingCost,
              other: order.otherCosts,
              qty: order.productList.reduce((sum, p) => sum + p.quantity, 0),
            },
            address: {
              name: order.customerName,
              country: order.country,
              address: order.address,
            },
            shippingMethod: order.logistics,
            trackId: order.trackingNumber,
            remark: '',
            status: order.status as SampleOrder['status'],
            productList: order.productList.map((p) => ({
              id: p.id,
              productName: p.productName,
              productVariant: p.productVariant,
              quantity: p.quantity,
              productImageUrl: p.productImageUrl,
              productLink: p.productLink,
              price: p.price,
              totalPrice: p.totalPrice,
            })),
          }
        })

        setData(sampleOrders)
        setTotalCount(response.total)
      } catch (error) {
        console.error('获取样品订单列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load sample orders. Please try again.'
        )
        setData([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchOrders()
  }, [auth.user?.customerId, pagination.pageIndex, pagination.pageSize, globalFilter, refreshKey])

  // Filter data based on active tab
  const filteredData = data.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  const handlePay = (orderId: string) => {
    const order = data.find((o) => o.id === orderId)
    if (order) {
      // Convert SampleOrder to OrderPayable
      setSelectedOrderForPayment({
        id: order.id,
        getTotalAmount: () => order.cost.total,
      })
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

  const handleDelete = async (orderId: string) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    try {
      await deleteOrder({
        customerId: String(customerId),
        orderId: String(orderId),
      })
      toast.success('Order deleted successfully')
      // 刷新订单列表
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('删除订单失败:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete order. Please try again.'
      )
    }
  }

  const columns = useMemo(
    () =>
      createSampleOrdersColumns({
        onPay: handlePay,
        onEditAddress: handleEditAddress,
        onAddPackage: handleAddPackage,
        onDelete: handleDelete,
      }),
    [auth.user?.customerId, handleDelete]
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
    manualPagination: true, // 启用服务端分页
    pageCount: Math.ceil(totalCount / pagination.pageSize),
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
          {/* Total Amount and Batch Payment - positioned at top left */}
          {(() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            const selectedCount = selectedRows.length
            const totalAmount = selectedRows.reduce((sum, row) => {
              return sum + (row.original.cost.total || 0)
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
                      // TODO: Implement batch payment dialog
                      console.log(
                        'Batch payment for orders:',
                        selectedRows.map((row) => row.original.id)
                      )
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                      Loading sample orders...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
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

          <SampleOrdersTableFooter table={table} totalRows={totalCount} />
        </TabsContent>
      </Tabs>

      <SampleOrdersBulkActions table={table} />

      <OrderPayDialog
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
