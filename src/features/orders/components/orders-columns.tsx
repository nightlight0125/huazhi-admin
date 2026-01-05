import { useState } from 'react'
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import {
  CreditCard,
  Edit,
  Loader2,
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Order } from '../data/schema'

// 删除订单单元格组件
interface OrderDeleteCellProps {
  row: Row<Order>
  onDelete?: (orderId: string) => void | Promise<void>
}

function OrderDeleteCell({ row, onDelete }: OrderDeleteCellProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const order = row.original

  const handleConfirmDelete = async () => {
    if (!onDelete) return

    setIsLoading(true)
    try {
      await onDelete(order.id)
      setOpen(false)
    } catch (error) {
      // 错误处理已经在 handleDelete 中完成，这里只需要确保加载状态被重置
      console.error('删除订单失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='h-8 px-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300'
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Trash2 className='h-3.5 w-3.5' />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!isLoading) {
            setOpen(newOpen)
          }
        }}
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={isLoading}
        title={<span className='text-destructive'>Delete Order</span>}
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this order?
              <br />
              This action cannot be undone.
            </p>
            <p className='text-muted-foreground text-sm'>
              Order Number: <strong>{order.orderNumber}</strong>
            </p>
          </>
        }
        confirmText={
          isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Deleting...
            </>
          ) : (
            'Delete'
          )
        }
      />
    </>
  )
}

// 平台订单状态标签映射
function getPlatformOrderStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    '0': 'Cancelled',
    no: 'Not Linked to Local SKU',
    '1': 'Pending Payment',
    '2': 'Paid',
    '3': 'Processing',
    '4': 'Shipped',
  }
  return statusMap[status] || status
}

// 平台订单状态样式映射
function getPlatformOrderStatusClassName(status: string): string {
  // 0: 取消 - 红色背景，白色文字
  if (status === '0') {
    return 'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white'
  }
  // no: 未关联本地sku - 灰色背景，白色文字
  if (status === 'no') {
    return 'border-transparent bg-gray-500 text-white dark:bg-gray-500 dark:text-white'
  }
  // 1: 待支付 - 橙色背景，白色文字
  if (status === '1') {
    return 'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white'
  }
  // 2: 已支付 - 绿色背景，白色文字
  if (status === '2') {
    return 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white'
  }
  // 3: 处理中 - 紫色背景，白色文字
  if (status === '3') {
    return 'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-white'
  }
  // 4: 已发货 - 蓝色背景，白色文字
  if (status === '4') {
    return 'border-transparent bg-blue-500 text-white dark:bg-blue-500 dark:text-white'
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
  onDelete?: (orderId: string) => void | Promise<void>
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
        const label = getPlatformOrderStatusLabel(status)

        return (
          <div className='flex flex-col gap-1.5 text-sm'>
            <Badge variant='outline' className={className}>
              {label}
            </Badge>
            <Badge variant='outline' className={className}>
              {label}
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
            <OrderDeleteCell row={row} onDelete={onDelete} />
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
