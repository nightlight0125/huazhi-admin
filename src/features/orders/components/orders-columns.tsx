import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import {
  CreditCard,
  Edit,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type Order } from '../data/schema'

// 平台订单状态样式映射
function getPlatformOrderStatusClassName(status: string): string {
  const lowerStatus = status.toLowerCase()

  // Processing - 紫色背景，白色文字
  if (lowerStatus === 'processing') {
    return 'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-white'
  }
  // Cancelled - 红色背景，白色文字
  if (lowerStatus === 'cancelled') {
    return 'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white'
  }
  // Pending - 橙色背景，白色文字
  if (lowerStatus === 'pending') {
    return 'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white'
  }
  // Refunded - 橙色背景，白色文字
  if (lowerStatus === 'refunded') {
    return 'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white'
  }
  // Confirmed - 绿色背景，白色文字
  if (lowerStatus === 'confirmed') {
    return 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white'
  }
  // Shipped - 蓝色背景，白色文字
  if (lowerStatus === 'shipped') {
    return 'border-transparent bg-blue-500 text-white dark:bg-blue-500 dark:text-white'
  }
  // Delivered - 绿色背景，白色文字
  if (lowerStatus === 'delivered') {
    return 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white'
  }

  // 默认灰色
  return 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

export const createOrdersColumns = (options?: {
  onExpand?: (rowId: string) => void
  expandedRows?: Set<string>
  onModifyProduct?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onEditCustomerName?: (orderId: string) => void
  onPay?: (orderId: string) => void
  onDelete?: (orderId: string) => void
}): ColumnDef<Order>[] => {
  const {
    onExpand,
    expandedRows = new Set(),
    onModifyProduct: _onModifyProduct,
    onEditAddress,
    onEditCustomerName: _onEditCustomerName,
    onPay,
    onDelete,
  } = options || {}

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='选择全部'
          className='translate-y-[2px]'
        />
      ),
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => {
        const order = row.original
        const isExpanded = expandedRows.has(row.id)
        const hasProducts = order.productList && order.productList.length > 0

        return (
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label='选择行'
              className='translate-y-[2px]'
            />
            {hasProducts && (
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={(e) => {
                  e.stopPropagation()
                  onExpand?.(row.id)
                }}
              >
                {isExpanded ? (
                  <Minus className='h-4 w-4' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
              </Button>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
    {
      accessorKey: 'storeName',
      header: 'Store Name',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='flex items-center gap-2'>
            <ShoppingBag className='h-4 w-4 text-green-600' />
            <span className='font-medium'>{order.storeName}</span>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'orderNumbers',
      header: 'Store/No.',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.platformOrderNumber || '---'}</div>
            <div>{order.orderNumber || '---'}</div>
          </div>
        )
      },
      size: 180,
    },
    {
      id: 'orderTimes',
      header: 'Store/Time',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>
              {order.createdAt
                ? format(new Date(order.createdAt), 'MM-dd-yyyy')
                : '---'}
            </div>
            <div>
              {order.updatedAt
                ? format(new Date(order.updatedAt), 'MM-dd-yyyy')
                : '---'}
            </div>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'cost',
      header: 'Cost',
      cell: ({ row }) => {
        const order = row.original
        const totalQty =
          order.productList?.reduce((sum, p) => sum + p.quantity, 0) || 0
        const productTotal =
          order.productList?.reduce((sum, p) => sum + p.totalPrice, 0) || 0

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='cursor-default space-y-1 text-sm'>
                <div>Total: ${order.totalCost.toFixed(2)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className='space-y-0.5 text-xs'>
              <div>Product: ${productTotal.toFixed(2)}</div>
              <div>Shipping: ${order.shippingCost.toFixed(2)}</div>
              <div>Qty: {totalQty}</div>
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 150,
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              <span>{order.customerName}</span>
              <Button
                variant='ghost'
                size='icon'
                className='h-4 w-4'
                onClick={(e) => {
                  e.stopPropagation()
                  onEditAddress?.(order.id)
                }}
              >
                <Edit className='h-3 w-3' />
              </Button>
            </div>
            <div>二字码</div>
          </div>
        )
      },
      size: 200,
    },
    {
      id: 'shipping',
      header: 'Shipping/No.',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.logistics || '---'}</div>
            <div>{order.trackingNumber || '---'}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'platformHZStatus',
      header: 'Platform/Status',
      cell: ({ row }) => {
        const order = row.original
        const status = order.platformOrderStatus

        if (!status) {
          return (
            <div className='space-y-1 text-sm'>
              <div>---</div>
            </div>
          )
        }

        const className = getPlatformOrderStatusClassName(status)

        return (
          <div className='flex flex-col gap-1.5 text-sm'>
            <Badge variant='outline' className={className}>
              {status}
            </Badge>
            <Badge variant='outline' className={className}>
              {status}
            </Badge>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        return (
          <div
            className='flex items-center gap-0'
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant='ghost'
              size='sm'
              className='text-primary hover:text-primary dark:text-primary dark:hover:text-primary -mr-1 h-8 px-1.5 hover:bg-transparent dark:hover:bg-transparent'
              onClick={() => {
                onPay?.(row.original.id)
              }}
            >
              <CreditCard className='h-3.5 w-3.5' />
              Pay
            </Button>
            {/* <OrdersRowActions
              row={row}
              onModifyProduct={onModifyProduct}
              onEditAddress={onEditAddress}
            /> */}
            <Button
              variant='ghost'
              size='sm'
              className='h-8 px-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300'
              onClick={() => {
                onDelete?.(row.original.id)
              }}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      size: 140,
    },
    // Hidden columns for filtering only
    {
      id: 'platformOrderStatus',
      accessorFn: (row) => row.platformOrderStatus || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
    {
      id: 'store',
      accessorFn: (row) => row.store || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
    {
      id: 'logistics',
      accessorFn: (row) => row.logistics || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
    {
      id: 'country',
      accessorFn: (row) => row.country || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
    {
      id: 'shippingOrigin',
      accessorFn: (row) => row.shippingOrigin || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
  ]
}

// 为了向后兼容，导出默认的列定义
export const ordersColumns = createOrdersColumns()
