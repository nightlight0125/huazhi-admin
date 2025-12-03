import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type SampleOrder } from '../data/schema'

export const createSampleOrdersColumns = (options?: {
  onPay?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void
}): ColumnDef<SampleOrder>[] => {
  const { onPay, onEditAddress, onAddPackage, onDelete } = options || {}

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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='选择行'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'orderNumber',
      header: 'Order No',
      cell: ({ row }) => {
        const order = row.original
        return <div className='font-medium'>{order.orderNumber}</div>
      },
      size: 150,
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: ({ row }) => {
        const order = row.original
        const firstProduct = order.productList?.[0]
        return (
          <div className='space-y-2'>
            {firstProduct && (
              <>
                {firstProduct.productImageUrl ? (
                  <img
                    src={firstProduct.productImageUrl}
                    alt={firstProduct.productName}
                    className='h-16 w-16 rounded object-cover'
                  />
                ) : (
                  <div className='bg-muted flex h-16 w-16 items-center justify-center rounded'>
                    <ImageIcon className='text-muted-foreground h-8 w-8' />
                  </div>
                )}
                <div className='text-sm'>
                  <div>SKU: {order.sku}</div>
                  <div>
                    Variant:{' '}
                    {firstProduct.productVariant
                      ?.map((v) => `${v.name}: ${v.value}`)
                      .join(', ') || 'xxxx'}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: 'createdAt',
      header: 'Creat Time',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='text-sm'>
            {format(new Date(order.createdAt), 'MM-dd-yyyy')}
          </div>
        )
      },
      size: 120,
    },
    {
      id: 'cost',
      header: 'Cost',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>Total: ${order.cost.total.toFixed(2)}</div>
            <div>Product: ${order.cost.product.toFixed(2)}</div>
            <div>Shipping: ${order.cost.shipping.toFixed(2)}</div>
            <div>Other: ${order.cost.other.toFixed(2)}</div>
            <div>Qty: {order.cost.qty}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'address',
      header: 'Adress',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>Name: {order.address.name}</div>
            <div>Country: {order.address.country}</div>
            <div>Adress: {order.address.address}</div>
          </div>
        )
      },
      size: 200,
    },
    {
      id: 'shipping',
      header: 'Shipping Method\nTrack ID',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.shippingMethod || '---'}</div>
            <div>{order.trackId || '---'}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'remark',
      header: 'Remark',
      cell: ({ row }) => {
        const remark = (row.getValue('remark') as string) || '---'
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='text-muted-foreground max-w-[80px] truncate text-xs'>
                {remark}
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-xs text-xs'>
              {remark}
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 80,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusColors: Record<string, string> = {
          paid: 'bg-green-100 text-green-800',
          shipped: 'bg-blue-100 text-blue-800',
          pending: 'bg-yellow-100 text-yellow-800',
          processing: 'bg-purple-100 text-purple-800',
          completed: 'bg-gray-100 text-gray-800',
          canceled: 'bg-red-100 text-red-800',
          quoting: 'bg-orange-100 text-orange-800',
          pay_in_progress: 'bg-indigo-100 text-indigo-800',
        }
        return (
          <div className='space-y-1'>
            <Badge
              className={statusColors[status] || 'bg-gray-100 text-gray-800'}
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        )
      },
      size: 120,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='flex flex-col gap-1'>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                onPay?.(order.id)
              }}
            >
              Pay
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
              Edit Adress
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                onAddPackage?.(order.id)
              }}
            >
              Add Package
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-7 text-xs text-red-600 hover:text-red-700'
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(order.id)
              }}
            >
              Delete
            </Button>
          </div>
        )
      },
      enableSorting: false,
      size: 140,
    },
    // Hidden columns for filtering only
    {
      id: 'productName',
      accessorFn: (row) => row.productList?.[0]?.productName || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
    {
      id: 'logistics',
      accessorFn: (row) => row.shippingMethod || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
  ]
}
