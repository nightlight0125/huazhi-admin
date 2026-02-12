import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  CreditCard,
  Edit,
  Loader2,
  Minus,
  Plus,
  Trash2
} from 'lucide-react'
import { useState } from 'react'
import { type Order } from '../data/schema'

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
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => {
        const order = row.original
        const isExpanded = expandedRows.has(row.id)
        const hasProducts =
          (order as any).lingItems?.length > 0 ||
          (order.productList && order.productList.length > 0)

        return (
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label='Select row'
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
        const shopName =
          (order as any).hzkj_shop_name?.GLang || order.storeName || order.store
        return (
          <div className='flex items-center gap-2'>
            <span className='font-medium'>{shopName}</span>
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
        const billno =
          (order as any).billno ||
          order.platformOrderNumber ||
          order.orderNumber
        return (
          <div className='space-y-1 text-sm'>
            <div>{billno || '---'}</div>
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
        const createtime = (order as any).createtime
        const date = createtime ? new Date(createtime) : order.createdAt
        return (
          <div className='space-y-1 text-sm'>
            <div>{date ? format(date, 'MM-dd-yyyy') : '---'}</div>
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

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='cursor-default space-y-1 text-sm'>
                <div>Total: ${(order.hzkj_order_amount || 0).toFixed(2)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className='space-y-0.5 text-xs'>
              {/* <div>Product: ${productTotal.toFixed(2)}</div> */}
              {/* <div>Shipping: ${order.shippingCost.toFixed(2)}</div> */}
              {/* <div>Qty: {order.hzkj_netweight_total || 0}</div> */}
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
        const customerName =
          (order as any).hzkj_customer_name?.GLang ||
          order.customerName ||
          '---'
        return (
          <div className='space-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              <span>{customerName}</span>
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
            <div>{order.hzkj_country_code || '---'}</div>
          </div>
        )
      },
      size: 200,
    },
    {
      id: 'shippingCost',
      header: 'Shipping Cost',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.hzkj_fre_quo_amount || 0}</div>
            <div>{order.hzkj_customer_channel_name || '---'}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'shipping',
      header: 'Shipping/No.',
      cell: ({ row }) => {
        const order = row.original
        const providers = (order as any).providers || order.logistics || '---'
        return (
          <div className='space-y-1 text-sm'>
            <div>{providers}</div>
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
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.hzkj_fulfillment_status || '---'}</div>
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
    {
      id: 'hzkj_bizdate',
      accessorFn: (row) => (row as any).hzkj_bizdate || '',
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
