import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { HelpCircle } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  deleteOrder,
  queryOrder,
  updateOrderCancelStatus,
  updateSalOutOrder,
} from '@/lib/api/orders'
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
import { DataTableToolbar } from '@/components/data-table'
import { type AddressData } from '@/components/edit-address-dialog'
import {
  OrderPayDialog,
  type OrderPayable,
} from '@/components/order-pay-dialog'
import { OrdersEditAddressDialog } from '@/features/orders/components/orders-edit-address-dialog'
import { sampleOrderStatuses } from '../data/data'
import { type SampleOrder } from '../data/schema'
import { SampleOrdersActionsMenu } from './sample-orders-actions-menu'
import { SampleOrdersBulkActions } from './sample-orders-bulk-actions'
import { createSampleOrdersColumns } from './sample-orders-columns'
import { SampleOrdersTableFooter } from './sample-orders-table-footer'

const route = getRouteApi('/_authenticated/sample-orders/')

type DataTableProps = {
  data?: SampleOrder[]
}

export function SampleOrdersTable({ data: _data }: DataTableProps) {
  const { auth } = useAuthStore()
  const [data, setData] = useState<SampleOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  // 用于跟踪上一次请求的参数，避免重复请求
  const lastRequestParamsRef = useRef<string>('')
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    productName: false,
    logistics: false,
  })
  const [activeTab, setActiveTab] = useState('')
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

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

  const fetchOrders = useCallback(async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      setIsLoading(false)
      setData([])
      setTotalCount(0)
      return
    }

    const pageIndex = pagination.pageIndex ?? 0
    const pageSize = pagination.pageSize ?? 10

    // Tab 切换通过 orderStatus 字段过滤
    const orderStatus =
      activeTab && activeTab !== '' ? String(activeTab) : undefined

    // 格式化日期范围
    const formattedDateRange =
      dateRange?.from && dateRange?.to
        ? {
            startDate: format(dateRange.from, 'yyyy-MM-dd 00:00:00'),
            endDate: format(dateRange.to, 'yyyy-MM-dd 23:59:59'),
          }
        : undefined

    // 生成请求参数的唯一标识
    const requestKey = `${customerId}-${pageIndex}-${pageSize}-${globalFilter || ''}-${orderStatus || ''}-${formattedDateRange?.startDate || ''}-${formattedDateRange?.endDate || ''}-${refreshKey}`

    // 如果请求参数相同，跳过重复请求
    if (lastRequestParamsRef.current === requestKey) {
      return
    }

    // 更新请求参数标识
    lastRequestParamsRef.current = requestKey

    setIsLoading(true)

    try {
      const response = await queryOrder({
        customerId: String(customerId),
        type: 'hzkj_orders_BT_Sample',
        str: globalFilter || '',
        pageIndex,
        pageSize,
        orderStatus,
        startDate: formattedDateRange?.startDate,
        endDate: formattedDateRange?.endDate,
      })

      setData(response.orders as any)
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
  }, [
    auth.user?.customerId,
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    refreshKey,
    activeTab,
    dateRange,
  ])

  useEffect(() => {
    // 如果日期范围不完整，不执行请求
    if (dateRange && !(dateRange.from && dateRange.to)) {
      return
    }

    // 使用 setTimeout 防抖，延迟执行请求，避免在状态快速变化时触发多次请求
    const timeoutId = setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [fetchOrders, dateRange])

  // 移除客户端过滤，因为现在由后端根据 activeTab 过滤

  const getOrderAmount = (order: any) => {
    if (order.hzkj_total_amount !== undefined && order.hzkj_total_amount !== null) {
      const amount = order.hzkj_total_amount
      return typeof amount === 'string'
        ? parseFloat(amount) || 0
        : typeof amount === 'number'
          ? amount
          : 0
    }
    if (order.hzkj_order_amount !== undefined) {
      const amount = order.hzkj_order_amount
      return typeof amount === 'string'
        ? parseFloat(amount) || 0
        : typeof amount === 'number'
          ? amount
          : 0
    }
    if (order.cost?.total !== undefined) {
      return typeof order.cost.total === 'number'
        ? order.cost.total
        : parseFloat(String(order.cost.total)) || 0
    }
    return 0
  }

  const handlePay = (orderId: string) => {
    const order = data.find((o) => o.id === orderId) as any
    if (order) {
      setSelectedOrderForPayment({
        id: order.id,
        getTotalAmount: () => getOrderAmount(order),
      })
      setPayDialogOpen(true)
    }
  }

  const handleBatchPay = (selectedRows: { original: any }[]) => {
    if (selectedRows.length === 0) return
    const orderIds = selectedRows.map((r) => r.original.id)
    const totalAmount = selectedRows.reduce(
      (sum, row) => sum + getOrderAmount(row.original),
      0
    )
    setSelectedOrderForPayment({
      id: orderIds[0],
      getTotalAmount: () => totalAmount,
      orderIds,
    })
    setPayDialogOpen(true)
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

  const handleConfirmEditAddress = async (addressData: AddressData) => {
    const order = editAddressDialog.order as any
    const customerId = auth.user?.customerId

    if (!order || !customerId) {
      toast.error('Order or customer information is missing')
      setEditAddressDialog({ open: false, order: null })
      return
    }

    // 对于样品订单，目前后端没有提供行级 lingItems，detail 先传空数组
    const detail: any[] = []

    const firstName =
      (addressData as any).firstName ??
      addressData.customerName.split(' ')[0] ??
      ''
    const lastName =
      (addressData as any).lastName ??
      addressData.customerName.split(' ').slice(1).join(' ') ??
      ''

    try {
      await updateSalOutOrder({
        orderId: order.id,
        customerId: String(customerId),
        firstName,
        lastName,
        phone: addressData.phoneNumber,
        countryId: (addressData as any).countryId ?? '',
        admindivisionId: (addressData as any).admindivisionId,
        city: addressData.city,
        address1: addressData.address,
        address2: addressData.address2,
        postCode: addressData.postalCode,
        taxId: (addressData as any).taxId || '',
        customChannelId: '',
        email: addressData.email || '',
        wareHouse:
          (addressData as any).warehouseId ?? addressData.shippingOrigin,
        detail,
      })

      toast.success('Sample order address updated successfully')
      setEditAddressDialog({ open: false, order: null })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to update sample order address:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update sample order address. Please try again.'
      )
    }
  }

  const handleAddPackage = (_orderId: string) => {
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

  const handleCancel = async (orderId: string) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    try {
      await updateOrderCancelStatus({
        customerId: String(customerId),
        orderId: String(orderId),
        orderType: 'sampleOrder',
      })
      toast.success('Order cancelled successfully')
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to cancel order. Please try again.'
      )
    }
  }

  const handleRestore = async (orderId: string) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    try {
      await updateOrderCancelStatus({
        customerId: String(customerId),
        orderId: String(orderId),
        orderType: 'sampleOrder',
        restore: true,
      })
      toast.success('Order restored successfully')
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to restore order. Please try again.'
      )
    }
  }

  const columns = useMemo(
    () =>
      createSampleOrdersColumns({
        onPay: handlePay,
        onCancel: handleCancel,
        onRestore: handleRestore,
        onEditAddress: handleEditAddress,
        onAddPackage: handleAddPackage,
        onDelete: handleDelete,
      }),
    [auth.user?.customerId, handleCancel, handleRestore, handleDelete]
  )

  const table = useReactTable({
    data: data,
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

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Enter Order Number,SKU,Product Name'
        dateRange={{
          enabled: true,
          columnId: 'createdAt',
          placeholder: 'Select Date Range',
          onDateRangeChange: (range) => {
            // 只更新状态，让 useEffect 来处理接口调用
            // 这样可以避免不必要的重新渲染，保持其他 UI 状态不变
            setDateRange(range)
          },
        }}
      />
      <div className='mb-2 flex items-center justify-end'>
        <SampleOrdersActionsMenu
          table={table}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
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
          {(() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            const selectedCount = selectedRows.length
            const totalAmount = selectedRows.reduce(
              (sum, row) => sum + getOrderAmount(row.original),
              0
            )

            return (
              <div className='border-border bg-card flex items-center justify-start gap-4 border-b px-4 py-3'>
                <div className='flex flex-col items-start'>
                  <div className='text-foreground text-sm'>
                    Total Amount:{' '}
                    <span className='font-medium'>
                      {selectedCount > 0 ? `$${totalAmount.toFixed(2)}` : '---'}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400'>
                    <HelpCircle className='h-3 w-3' />
                    <span>Referenced amount</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (selectedCount > 0) {
                      handleBatchPay(selectedRows)
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
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      <div className='flex flex-col items-center justify-center gap-2'>
                        <p className='text-muted-foreground text-sm'>
                          在加载中
                        </p>
                      </div>
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
                      No data
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
        orderType={1} // 1 表示样品订单
        onPaymentSuccess={() => {
          // 支付成功后刷新订单列表并清空勾选
          setRefreshKey((prev) => prev + 1)
          setRowSelection({})
        }}
      />

      <OrdersEditAddressDialog
        open={editAddressDialog.open}
        onOpenChange={(open) =>
          setEditAddressDialog({ ...editAddressDialog, open })
        }
        // 对于样品订单，底层数据同样来自 queryOrder/transformApiOrderToOrder，
        // 因此可以复用普通订单的 OrdersEditAddressDialog 映射逻辑
        order={editAddressDialog.order as any}
        onConfirm={handleConfirmEditAddress}
      />
    </div>
  )
}
