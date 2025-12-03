import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type Order } from '../data/schema'

export const createOrdersColumns = (options?: {
  onExpand?: (rowId: string) => void
  expandedRows?: Set<string>
  onModifyProduct?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
}): ColumnDef<Order>[] => {
  const {
    onExpand,
    expandedRows = new Set(),
    onModifyProduct,
    onEditAddress,
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
      header: 'Store Order Number\nHZ Order Number',
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
      header: 'Store Order Time\nHZ Order Time',
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
          <div className='space-y-1 text-sm'>
            <div>Total: ${order.totalCost.toFixed(2)}</div>
            <div>Product: ${productTotal.toFixed(2)}</div>
            <div>Shipping: ${order.shippingCost.toFixed(2)}</div>
            <div>Qty: {totalQty}</div>
          </div>
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
            <div>Name: {order.customerName}</div>
            <div>Country: {order.country}</div>
            <div>Address: {order.address}</div>
          </div>
        )
      },
      size: 200,
    },
    {
      id: 'shipping',
      header: 'Shipping Track ID',
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
      header: 'Platform/HZ Status',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.platformOrderStatus || '---'}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='flex flex-col gap-1'>
            <Button variant='outline' size='sm' className='h-7 text-xs'>
              Pay
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                onModifyProduct?.(order.id)
              }}
            >
              Modify Product
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                onEditAddress?.(order.id)
              }}
            >
              Edit Address
            </Button>
            <Button variant='outline' size='sm' className='h-7 text-xs'>
              Add Package
            </Button>
          </div>
        )
      },
      enableSorting: false,
      size: 120,
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
      id: 'platformFulfillmentStatus',
      accessorFn: (row) => row.platformFulfillmentStatus || '',
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
