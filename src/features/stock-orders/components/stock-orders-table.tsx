import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { deleteStockOrder, queryOrder, requestPayment } from '@/lib/api/orders'
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
import {
  OrderPayDialog,
  type OrderPayable,
} from '@/components/order-pay-dialog'
import { stockOrderStatuses } from '../data/data'
import { type StockOrder } from '../data/schema'
import { StockOrdersActionsMenu } from './stock-orders-actions-menu'
import { StockOrdersBulkActions } from './stock-orders-bulk-actions'
import { createStockOrdersColumns } from './stock-orders-columns'
import { StockOrdersTableFooter } from './stock-orders-table-footer'

const route = getRouteApi('/_authenticated/stock-orders/')

type DataTableProps = {
  data?: StockOrder[] // 改为可选，因为现在从 API 获取
}

export function StockOrdersTable({ data: _data }: DataTableProps) {
  const { auth } = useAuthStore()
  const [data, setData] = useState<StockOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const lastRequestParamsRef = useRef<string>('')
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    productName: false,
  })
  const [activeTab, setActiveTab] = useState('')
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<OrderPayable | null>(null)

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

    // 使用 activeTab 的值作为 shopOrderStatus 传给后端
    // 如果 activeTab 是空字符串（对应 'All' 标签），则不传 shopOrderStatus
    const shopOrderStatus =
      activeTab && activeTab !== '' ? String(activeTab) : undefined

    const requestKey = `${customerId}-${pageIndex}-${pageSize}-${globalFilter || ''}-${shopOrderStatus || ''}-${refreshKey}`

    if (lastRequestParamsRef.current === requestKey) {
      return
    }

    lastRequestParamsRef.current = requestKey

    setIsLoading(true)

    try {
      const response = await queryOrder({
        customerId: String(customerId),
        type: 'stock',
        str: globalFilter || '',
        pageIndex,
        pageSize,
        shopOrderStatus,
      })

      console.log(response.orders, 'response')

      setData(response.orders as any)
      setTotalCount(response.total)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to load stock orders. Please try again.'
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
  ])

  useEffect(() => {
    // 使用 setTimeout 防抖，延迟执行请求，避免在状态快速变化时触发多次请求
    const timeoutId = setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [fetchOrders])

  const handlePay = (orderId: string) => {
    const order = data.find((o) => o.id === orderId) as any
    if (order) {
      setSelectedOrderForPayment({
        id: order.id,
        getTotalAmount: () => {
          // 优先使用后端返回的 hzkj_order_amount 字段
          if (order.hzkj_order_amount !== undefined) {
            const amount = order.hzkj_order_amount
            return typeof amount === 'string'
              ? parseFloat(amount) || 0
              : typeof amount === 'number'
                ? amount
                : 0
          }

          // 如果没有 hzkj_order_amount，使用 cost.total
          if (order.cost?.total !== undefined) {
            return typeof order.cost.total === 'number'
              ? order.cost.total
              : parseFloat(String(order.cost.total)) || 0
          }

          return 0
        },
      })
      setPayDialogOpen(true)
    }
  }

  const handleEditAddress = (orderId: string) => {
    console.log('Edit address for order:', orderId)
  }

  const handleAddPackage = (orderId: string) => {
    console.log('Add package for order:', orderId)
  }

  const handleDelete = async (orderId: string) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    try {
      await deleteStockOrder({
        customerId: String(customerId),
        orderId: String(orderId),
      })
      toast.success('Order deleted successfully')
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('删除库存订单失败:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete order. Please try again.'
      )
    }
  }

  const handleBatchPayment = async (orderIds: string[]) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    if (orderIds.length === 0) {
      toast.error('Please select at least one order')
      return
    }

    try {
      await requestPayment({
        customerId: String(customerId),
        orderIds,
        type: 2, // 2 表示库存订单
      })

      toast.success(
        `Payment request submitted successfully for ${orderIds.length} order(s)`
      )
      // 刷新订单列表
      setRefreshKey((prev) => prev + 1)
      // 清空选择
      setRowSelection({})
    } catch (error) {
      console.error('Failed to request batch payment:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to request batch payment. Please try again.'
      )
    }
  }

  const columns = useMemo(
    () =>
      createStockOrdersColumns({
        onPay: handlePay,
        onEditAddress: handleEditAddress,
        onAddPackage: handleAddPackage,
        onDelete: handleDelete,
      }),
    [auth.user?.customerId, handleDelete]
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

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <p className='text-muted-foreground text-sm'>Loading stock orders...</p>
      </div>
    )
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Enter Order Number,SKU,Product Name'
      />
      <div className='mb-2 flex items-center justify-end'>
        <StockOrdersActionsMenu />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          {stockOrderStatuses.map((status) => (
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
            const totalAmount = selectedRows.reduce((sum, row) => {
              const order = row.original as any

              // 优先使用后端返回的 hzkj_order_amount 字段
              if (order.hzkj_order_amount !== undefined) {
                const amount = order.hzkj_order_amount
                const total =
                  typeof amount === 'string'
                    ? parseFloat(amount) || 0
                    : typeof amount === 'number'
                      ? amount
                      : 0
                return sum + total
              }

              // 如果没有 hzkj_order_amount，使用 cost.total
              if (order.cost?.total !== undefined) {
                const total =
                  typeof order.cost.total === 'number'
                    ? order.cost.total
                    : parseFloat(String(order.cost.total)) || 0
                return sum + total
              }

              return sum
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
                      const orderIds = selectedRows.map(
                        (row) => row.original.id
                      )
                      void handleBatchPayment(orderIds)
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

          <StockOrdersTableFooter table={table} totalRows={totalCount} />
        </TabsContent>
      </Tabs>

      <StockOrdersBulkActions table={table} />

      <OrderPayDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        order={selectedOrderForPayment}
        onPaymentSuccess={() => {
          // 支付成功后刷新订单列表
          setRefreshKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}
