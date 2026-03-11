import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
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
import { HelpCircle, Loader2 } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { type FreightOption, calcuOrderFreight } from '@/lib/api/logistics'
import { deleteOrder, queryOrder, updateSalOutOrder } from '@/lib/api/orders'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableToolbar } from '@/components/data-table'
import {
  OrderPayDialog,
  type OrderPayable,
} from '@/components/order-pay-dialog'
import { orderStatuses } from '../data/data'
import { type Order, type OrderProduct } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { OrderAvailableShippingMethodsDialog } from './order-available-shipping-methods-dialog'
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
  orderId,
  orderNumber,
  onDelete,
  orderStatus,
}: {
  product: OrderProduct
  onModifyProduct?: () => void
  orderId: string
  orderNumber?: string
  onDelete?: (orderId: string) => void | Promise<void>
  orderStatus?: string
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(orderId)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('删除订单失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const isModifyDisabled = orderStatus === 'no'
  const fieldLabels = ['Shopify', 'SKU', 'Price', 'Quantity']
  const leftButtons = ['Store', 'HZ']
  const rightButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    tooltip?: string
  }> = [
    {
      label: 'Modify Product',
      onClick: onModifyProduct || (() => {}),
      disabled: isModifyDisabled,
      tooltip: isModifyDisabled ? 'No local matching SKU' : undefined,
    },
    { label: 'Delete', onClick: handleDeleteClick },
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
    <React.Fragment>
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
              {rightButtons.map((button) => {
                const btn = (
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-5 text-[11px]'
                    onClick={button.disabled ? undefined : button.onClick}
                    disabled={button.disabled}
                  >
                    {button.label}
                  </Button>
                )
                return button.tooltip && button.disabled ? (
                  <Tooltip key={button.label}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent>{button.tooltip}</TooltipContent>
                  </Tooltip>
                ) : (
                  <React.Fragment key={button.label}>{btn}</React.Fragment>
                )
              })}
            </div>
          </div>
        </TableCell>
      </TableRow>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(newOpen) => {
          if (!isDeleting) {
            setDeleteDialogOpen(newOpen)
          }
        }}
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={isDeleting}
        title={<span className='text-destructive'>Delete Order</span>}
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this order?
              <br />
              This action cannot be undone.
            </p>
            {orderNumber && (
              <p className='text-muted-foreground text-sm'>
                Order Number: <strong>{orderNumber}</strong>
              </p>
            )}
          </>
        }
        confirmText={
          isDeleting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Deleting...
            </>
          ) : (
            'Delete'
          )
        }
      />
    </React.Fragment>
  )
}

export function OrdersTable({
  onTableReady,
  storeOptions = [],
  platformOrderStatusOptions = [],
  countryOptions = [],
}: DataTableProps) {
  const searchParams = route.useSearch() as Record<string, unknown>
  const { auth } = useAuthStore()
  const [data, setData] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const lastRequestParamsRef = useRef<string>('')

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
  const [activeTab, setActiveTab] = useState(() => {
    const initial = searchParams.orderStatus
    return typeof initial === 'string' ? initial : ''
  })
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [modifyProductDialog, setModifyProductDialog] = useState<{
    open: boolean
    products: OrderProduct[]
    orderId: string
    order?: any
  }>({
    open: false,
    products: [],
    orderId: '',
    order: undefined,
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
  const [shippingMethodDialog, setShippingMethodDialog] = useState<{
    open: boolean
    order: Order | null
  }>({ open: false, order: null })
  const [shippingOptions, setShippingOptions] = useState<FreightOption[]>([])
  const [isLoadingShippingOptions, setIsLoadingShippingOptions] =
    useState(false)
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
    search: searchParams,
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

  // 当 URL 中的 orderStatus 发生变化时，同步到当前激活的 Tab
  useEffect(() => {
    const urlStatus = searchParams.orderStatus
    if (typeof urlStatus === 'string' && urlStatus !== activeTab) {
      setActiveTab(urlStatus)
    }
  }, [searchParams, activeTab])

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

    const platformOrderStatusFilter = columnFilters.find(
      (f) => f.id === 'platformOrderStatus'
    )
    const shopOrderStatus =
      platformOrderStatusFilter &&
      Array.isArray(platformOrderStatusFilter.value) &&
      platformOrderStatusFilter.value.length > 0
        ? String(platformOrderStatusFilter.value[0])
        : undefined

    const countryFilter = columnFilters.find((f) => f.id === 'country')
    const countryIds =
      countryFilter &&
      Array.isArray(countryFilter.value) &&
      countryFilter.value.length > 0
        ? countryFilter.value.map((id) => String(id))
        : undefined

    // 根据 Tab（支付状态）设置订单状态（字符串），用于后端过滤
    const orderStatus =
      activeTab && activeTab !== '' ? String(activeTab) : undefined

    // 将国家ID数组转换为字符串用于请求 key（用于去重）
    const countryIdsKey = countryIds ? countryIds.sort().join(',') : ''
    const orderStatusKey = orderStatus ?? ''
    const requestKey = `${customerId}-${pageIndex}-${pageSize}-${globalFilter || ''}-${shopId || ''}-${shopOrderStatus || ''}-${countryIdsKey}-${orderStatusKey}-${formattedDateRange?.startDate || ''}-${formattedDateRange?.endDate || ''}-${refreshKey}-${activeTab}`

    if (lastRequestParamsRef.current === requestKey) {
      return
    }

    lastRequestParamsRef.current = requestKey

    setIsLoading(true)

    try {
      const response = await queryOrder({
        customerId: String(customerId),
        type: 'hzkj_orders_BT_Sample',
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
    setModifyProductDialog({
      open: false,
      products: [],
      orderId: '',
      order: undefined,
    })
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

  const handleSelectShippingMethod = (order: Order) => {
    setShippingMethodDialog({ open: true, order })
  }

  // 打开物流弹框时拉取可用物流方式
  useEffect(() => {
    if (!shippingMethodDialog.open || !shippingMethodDialog.order) {
      setShippingOptions([])
      return
    }
    const order = shippingMethodDialog.order

    let cancelled = false
    setIsLoadingShippingOptions(true)
    setShippingOptions([])

    calcuOrderFreight({ orderId: order.id })
      .then((list) => {
        if (cancelled) return
        setShippingOptions(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        if (!cancelled) setShippingOptions([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingShippingOptions(false)
      })

    return () => {
      cancelled = true
    }
  }, [shippingMethodDialog.open, shippingMethodDialog.order])

  const handleShippingMethodSelect = async (
    _orderId: string,
    method: FreightOption
  ) => {
    const order = shippingMethodDialog.order
    const customerId = auth.user?.customerId

    if (!order || !customerId) {
      toast.error('Order or customer information is missing')
      setShippingMethodDialog({ open: false, order: null })
      return
    }

    const rawOrder = order as any

    const detail =
      (rawOrder.lingItems || [])
        .map((item: any) => ({
          entryId: String(item.entryId || ''),
          skuId: String(
            item.hzkj_local_sku_id ||
              item.hzkj_local_sku_id2 ||
              item.hzkj_local_sku ||
              ''
          ),
          quantity: Number(item.hzkj_qty || item.hzkj_src_qty || 0) || 0,
          flag: 0,
        }))
        .filter((d: any) => d.entryId && d.skuId) || []

    const firstName =
      rawOrder.firstName ||
      (rawOrder.customerName &&
        typeof rawOrder.customerName === 'string' &&
        rawOrder.customerName.split(' ')[0]) ||
      (rawOrder.hzkj_customer_name &&
        typeof rawOrder.hzkj_customer_name === 'object' &&
        rawOrder.hzkj_customer_name.zh_CN) ||
      ''
    const lastName =
      rawOrder.lastName ||
      (rawOrder.customerName &&
        typeof rawOrder.customerName === 'string' &&
        rawOrder.customerName.split(' ').slice(1).join(' ')) ||
      ''

    try {
      await updateSalOutOrder({
        orderId: rawOrder.id || order.id,
        customerId: String(customerId),
        firstName,
        lastName,
        phone:
          rawOrder.phone ||
          rawOrder.hzkj_telephone ||
          rawOrder.phoneNumber ||
          '',
        countryId: rawOrder.countryId || rawOrder.hzkj_country_id || '',
        admindivisionId: rawOrder.admindivisionId,
        city: rawOrder.city || rawOrder.hzkj_address?.split(',')[0] || '',
        address1:
          rawOrder.address1 ||
          rawOrder.address ||
          rawOrder.hzkj_address ||
          rawOrder.hzkj_bill_address ||
          '',
        address2: rawOrder.address2 || rawOrder.hzkj_sam_address || '',
        postCode:
          rawOrder.postCode ||
          rawOrder.postalCode ||
          rawOrder.hzkj_post_code ||
          '',
        taxId: rawOrder.taxId || '',
        customChannelId: String(method.logsId),
        email: rawOrder.email || rawOrder.hzkj_email || '',
        wareHouse:
          rawOrder.wareHouse ||
          rawOrder.warehouseId ||
          rawOrder.shippingOrigin ||
          '',
        detail,
      })

      toast.success(`Shipping method set to ${method.logsNumber}`)
      setShippingMethodDialog({ open: false, order: null })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to update shipping method:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update shipping method.'
      )
    }
  }

  const handleConfirmEditAddress = async (addressData: {
    customerName: string
    firstName?: string
    lastName?: string
    address: string
    address2?: string
    city: string
    country: string
    province?: string
    postalCode: string
    phoneNumber: string
    email?: string
    shippingOrigin: string
    countryId?: number
    admindivisionId?: string
    cityId?: string
    warehouseId?: string
    taxId?: string
  }) => {
    const order = editAddressDialog.order
    const customerId = auth.user?.customerId

    if (!order || !customerId) {
      toast.error('Order or customer information is missing')
      setEditAddressDialog({ open: false, order: null })
      return
    }

    const rawOrder = order as any

    // 构造明细列表 detail
    const detail =
      (rawOrder.lingItems || [])
        .map((item: any) => ({
          entryId: String(item.entryId || ''),
          skuId: String(
            item.hzkj_local_sku_id ||
              item.hzkj_local_sku_id2 ||
              item.hzkj_local_sku ||
              ''
          ),
          quantity: Number(item.hzkj_qty || item.hzkj_src_qty || 0) || 0,
          flag: 0,
        }))
        .filter((d: any) => d.entryId && d.skuId) || []

    const firstName =
      addressData.firstName ?? addressData.customerName.split(' ')[0] ?? ''
    const lastName =
      addressData.lastName ??
      addressData.customerName.split(' ').slice(1).join(' ') ??
      ''

    try {
      await updateSalOutOrder({
        orderId: rawOrder.id || order.id,
        customerId: String(customerId),
        firstName,
        lastName,
        phone: addressData.phoneNumber,
        countryId: addressData.countryId ?? '',
        admindivisionId: addressData.admindivisionId,
        city: addressData.city,
        address1: addressData.address,
        address2: addressData.address2,
        postCode: addressData.postalCode,
        taxId: addressData.taxId || '',
        customChannelId: '',
        email: addressData.email || '',
        wareHouse: addressData.warehouseId ?? addressData.shippingOrigin,
        detail,
      })

      toast.success('Order address updated successfully')
      setEditAddressDialog({ open: false, order: null })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to update order address:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update order address. Please try again.'
      )
    }
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
        getTotalAmount: () => order.totalCost ?? 0,
      })
      setPayDialogOpen(true)
    }
  }

  const handleBatchPay = (selectedRows: { original: { id: string; totalCost?: number } }[]) => {
    if (selectedRows.length === 0) return
    const orderIds = selectedRows.map((r) => r.original.id)
    const totalAmount = selectedRows.reduce(
      (sum, r) => sum + (r.original.totalCost ?? 0),
      0
    )
    setSelectedOrderForPayment({
      id: orderIds[0],
      getTotalAmount: () => totalAmount,
      orderIds,
    })
    setPayDialogOpen(true)
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
              order,
            })
          } else {
            setModifyProductDialog({
              open: true,
              products: [],
              orderId,
              order,
            })
          }
        },
        onEditAddress: handleEditAddress,
        onEditCustomerName: handleEditCustomerName,
        onPay: handlePay,
        onDelete: handleDelete,
        onSelectShippingMethod: handleSelectShippingMethod,
      }),
    [
      expandedRows,
      data,
      auth.user?.customerId,
      handleDelete,
      handleSelectShippingMethod,
    ]
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
          },
          {
            columnId: 'country',
            title: 'Country',
            options: countryOptions,
          },
        ]}
      />
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
              <div className='flex items-center justify-start gap-4 border-b border-border bg-card px-4 py-3'>
                <div className='flex flex-col items-start'>
                  <div className='text-sm text-foreground'>
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
                                  orderId={order.id}
                                  orderNumber={order.orderNumber}
                                  orderStatus={order.hzkj_orderstatus}
                                  onDelete={handleDelete}
                                  onModifyProduct={() => {
                                    setModifyProductDialog({
                                      open: true,
                                      products: order.lingItems || [],
                                      orderId: order.id,
                                      order,
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
                      No data
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
            setModifyProductDialog({
              open: false,
              products: [],
              orderId: '',
              order: undefined,
            })
          } else {
            setModifyProductDialog({ ...modifyProductDialog, open })
          }
        }}
        products={modifyProductDialog.products}
        onConfirm={handleConfirmModify}
        orderId={modifyProductDialog.orderId}
        order={modifyProductDialog.order}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1)
        }}
      />

      <OrdersEditAddressDialog
        open={editAddressDialog.open}
        onOpenChange={(open) =>
          setEditAddressDialog({ ...editAddressDialog, open })
        }
        order={editAddressDialog.order}
        onConfirm={handleConfirmEditAddress}
      />

      <OrderAvailableShippingMethodsDialog
        open={shippingMethodDialog.open}
        onOpenChange={(open) =>
          setShippingMethodDialog({ ...shippingMethodDialog, open })
        }
        order={shippingMethodDialog.order}
        shippingOptions={shippingOptions}
        isLoading={isLoadingShippingOptions}
        onSelect={handleShippingMethodSelect}
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
          // 支付成功后刷新订单列表并清空勾选
          setRefreshKey((prev) => prev + 1)
          setRowSelection({})
        }}
      />
    </div>
  )
}
