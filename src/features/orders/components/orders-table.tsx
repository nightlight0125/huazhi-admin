import { DataTableToolbar } from '@/components/data-table'
import {
  OrderPayDialog,
  type OrderPayable,
} from '@/components/order-pay-dialog'
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
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { deleteOrder, queryOrder, requestPayment } from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
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
import { format } from 'date-fns'
import { HelpCircle } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { orderStatuses } from '../data/data'
import { type Order, type OrderProduct } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createOrdersColumns } from './orders-columns'
import { OrdersEditAddressDialog } from './orders-edit-address-dialog'
import { OrdersEditCustomerNameDialog } from './orders-edit-customer-name-dialog'
import { OrdersModifyProductDialog } from './orders-modify-product-dialog'
import { OrdersTableFooter } from './orders-table-footer'

const route = getRouteApi('/_authenticated/orders/')

type FilterOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

type DataTableProps = {
  onTableReady?: (table: ReturnType<typeof useReactTable<Order>>) => void
  storeOptions?: FilterOption[]
  platformOrderStatusOptions?: FilterOption[]
  orderStatusOptions?: FilterOption[]
  countryOptions?: FilterOption[]
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

  // 格式化数值：如果是数字则保留两位小数，否则显示原值或 ---
  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return '---'
    }
    // 尝试转换为数字
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (!isNaN(numValue) && isFinite(numValue)) {
      return numValue.toFixed(2)
    }
    // 如果不是数字，返回原值
    return String(value)
  }

  return (
    <TableRow className='bg-muted/30'>
      <TableCell colSpan={100} className='px-3 py-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-start gap-2'>
            <div>
              <img
                src={product?.hzkj_picture || ''}
                alt={product?.hzkj_variant_name || ''}
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
                        style={{ width: '220px', wordBreak: 'break-all' }}
                        className='text-[12px]'
                      >
                        {index === 0
                          ? buttonIndex === 0
                            ? `Shopify:${product?.hzkj_variant_name || ''}`
                            : `Variant: ${(product as any)?.hzkj_sku_values || ''}`
                          : index === 1
                            ? buttonIndex === 0
                              ? `SKU:${product?.hzkj_shop_sku || '---'}`
                              : `SKU:${product?.hzkj_local_sku || '---'}`
                            : index === 2
                              ? buttonIndex === 0
                                ? `Price:${formatValue(product?.hzkj_shop_price)}`
                                : `Price:${formatValue(product?.hzkj_amount)}`
                              : index === 3
                                ? buttonIndex === 0
                                  ? `Quantity:${formatValue(product?.hzkj_src_qty)}`
                                  : `Quantity:${formatValue(product?.hzkj_qty)}`
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

export function OrdersTable({
  onTableReady,
  storeOptions = [],
  platformOrderStatusOptions = [],
  countryOptions = [],
}: DataTableProps) {
  const { auth } = useAuthStore()
  const [data, setData] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const lastRequestParamsRef = useRef<string>('')

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
  const [activeTab, setActiveTab] = useState('')
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
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedOrderForPayment, setSelectedOrderForPayment] =
    useState<OrderPayable | null>(null)
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
      { columnId: 'country', searchKey: 'country', type: 'array' },
      {
        columnId: 'shippingOrigin',
        searchKey: 'shippingOrigin',
        type: 'array',
      },
    ],
  })

  const formattedDateRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return {
        startDate: format(dateRange.from, 'yyyy-MM-dd 00:00:00'),
        endDate: format(dateRange.to, 'yyyy-MM-dd 23:59:59'),
      }
    }
    return undefined
  }, [dateRange])

  const isDateRangeComplete = useMemo(() => {
    return !!(dateRange?.from && dateRange?.to)
  }, [dateRange])

  const fetchOrders = useCallback(async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      setIsLoading(false)
      setData([])
      setTotalCount(0)
      return
    }

    // 如果日期范围不完整，不执行请求
    if (dateRange && !isDateRangeComplete) {
      return
    }

    const pageIndex = pagination.pageIndex ?? 0
    const pageSize = pagination.pageSize ?? 10

    const storeFilter = columnFilters.find((f) => f.id === 'store')
    const shopId =
      storeFilter &&
      Array.isArray(storeFilter.value) &&
      storeFilter.value.length > 0
        ? String(storeFilter.value[0])
        : undefined

    const shopOrderStatus =
      activeTab && activeTab !== '' ? String(activeTab) : undefined

    const countryFilter = columnFilters.find((f) => f.id === 'country')
    const countryIds =
      countryFilter &&
      Array.isArray(countryFilter.value) &&
      countryFilter.value.length > 0
        ? countryFilter.value.map((id) => String(id))
        : undefined

    // 获取平台订单状态过滤值（支持多选）
    const platformOrderStatusFilter = columnFilters.find((f) => f.id === 'platformOrderStatus')
    const orderStatus =
      platformOrderStatusFilter &&
      Array.isArray(platformOrderStatusFilter.value) &&
      platformOrderStatusFilter.value.length > 0
        ? platformOrderStatusFilter.value.map((status) => String(status))
        : undefined

    // 将国家ID数组和订单状态数组转换为字符串用于请求key（用于去重）
    const countryIdsKey = countryIds ? countryIds.sort().join(',') : ''
    const orderStatusKey = orderStatus ? orderStatus.sort().join(',') : ''
    const requestKey = `${customerId}-${pageIndex}-${pageSize}-${globalFilter || ''}-${shopId || ''}-${shopOrderStatus || ''}-${countryIdsKey}-${orderStatusKey}-${formattedDateRange?.startDate || ''}-${formattedDateRange?.endDate || ''}-${refreshKey}-${activeTab}`

    if (lastRequestParamsRef.current === requestKey) {
      return
    }

    lastRequestParamsRef.current = requestKey

    setIsLoading(true)

    try {
      const response = await queryOrder({
        customerId: String(customerId),
        type: 'hzkj_orders_BT',
        str: globalFilter || '',
        pageIndex,
        pageSize,
        shopId,
        shopOrderStatus,
        countryId: countryIds,
        orderStatus, 
        startDate: formattedDateRange?.startDate,
        endDate: formattedDateRange?.endDate,
      })

      console.log('queryOrder response ------111111111:', response)

      setData(response.orders as any)
      setTotalCount(response.total)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to load orders. Please try again.'
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
    columnFilters,
    refreshKey,
    activeTab,
    formattedDateRange,
    dateRange,
    isDateRangeComplete,
  ])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [fetchOrders])

  // 移除客户端过滤，因为现在由后端根据 activeTab 过滤
  const filteredData = data

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

  const handleConfirmModify = (_updatedProducts: OrderProduct[]) => {
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

  const handleConfirmEditAddress = (_addressData: {
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

  const handleConfirmEditCustomerName = (_customerName: string) => {
    setEditCustomerNameDialog({ open: false, order: null })
  }

  const handlePay = (orderId: string) => {
    const order = data.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrderForPayment({
        id: order.id,
        getTotalAmount: () => order.totalCost,
      })
      setPayDialogOpen(true)
    }
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
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
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
        type: 0, // 0 表示普通订单
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
      createOrdersColumns({
        onExpand: handleExpand,
        expandedRows,
        onModifyProduct: (orderId: string) => {
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
        onPay: handlePay,
        onDelete: handleDelete,
      }),
    [expandedRows, data, auth.user?.customerId, handleDelete]
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

  useEffect(() => {
    if (onTableReady) {
      onTableReady(table)
    }
  }, [table, onTableReady])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Order No.\SPU\Name'
        dateRange={{
          enabled: true,
          columnId: 'hzkj_bizdate',
          placeholder: 'Select Date Range',
          onDateRangeChange: setDateRange,
        }}
        filters={[
          {
            columnId: 'store',
            title: 'Store',
            options: storeOptions,
            singleSelect: true,
          },
          {
            columnId: 'platformOrderStatus',
            title: 'Store Order Status',
            options: platformOrderStatusOptions,
            // 移除 singleSelect: true，支持多选
          },
          // {
          //   columnId: 'status',
          //   title: 'Order Status',
          //   options: orderStatusOptions,
          //   singleSelect: true,
          // },
          {
            columnId: 'country',
            title: 'Country',
            options: countryOptions,
          },
        ]}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-9'>
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
                ) : table.getCoreRowModel().rows?.length ? (
                  table.getCoreRowModel().rows.map((row) => {
                    const order = row.original
                    console.log('order', order)
                    console.log(
                      'expandedRows=================================='
                    )
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
                            {(order.lingItems || []).map(
                              (product, idx): any => (
                                <ProductDetailRow
                                  key={idx}
                                  product={product}
                                  onModifyProduct={() => {
                                    setModifyProductDialog({
                                      open: true,
                                      products: order.lingItems || [],
                                      orderId: order.id,
                                    })
                                  }}
                                />
                              )
                            )}
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

          <OrdersTableFooter table={table} totalRows={totalCount} />
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

      <OrderPayDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        order={selectedOrderForPayment}
        orderType={0} // 普通订单：type = 0
        onPaymentSuccess={() => {
          // 支付成功后刷新订单列表
          setRefreshKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}
