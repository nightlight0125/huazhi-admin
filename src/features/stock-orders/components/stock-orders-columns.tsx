import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { type StockOrder } from '../data/schema'

export const createStockOrdersColumns = (options?: {
  onSelectOrder?: (orderId: string) => void
  onPay?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void
}): ColumnDef<StockOrder>[] => {
  const { onSelectOrder, onPay, onEditAddress, onAddPackage, onDelete } =
    options || {}

  return [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => {
        const order = row.original
        return (
          <RadioGroup value={row.id}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value={order.id}
                id={order.id}
                onClick={() => onSelectOrder?.(order.id)}
              />
              <Label htmlFor={order.id} className='sr-only'>
                Select order
              </Label>
            </div>
          </RadioGroup>
        )
      },
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
      size: 120,
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: ({ row }) => {
        const order = row.original
        const firstProduct = order.productList?.[0]
        return (
          <div className='flex items-center gap-2 pr-8'>
            {firstProduct && (
              <>
                {firstProduct.productImageUrl ? (
                  <img
                    src={firstProduct.productImageUrl}
                    alt={firstProduct.productName}
                    className='h-10 w-10 rounded object-cover'
                  />
                ) : (
                  <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded'>
                    <ImageIcon className='text-muted-foreground h-5 w-5' />
                  </div>
                )}
                <div className='text-sm'>
                  <div className='font-medium'>{order.sku}</div>
                </div>
              </>
            )}
            {!firstProduct && (
              <div className='text-sm font-medium'>{order.sku}</div>
            )}
          </div>
        )
      },
      size: 180,
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
      id: 'qty',
      header: 'QTY',
      cell: ({ row }) => {
        const order = row.original
        return <div className='text-sm'>{order.cost.qty}</div>
      },
      size: 80,
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const order = row.original
        return <div className='text-sm'>${order.cost.product.toFixed(2)}</div>
      },
      size: 100,
    },
    {
      id: 'otherFees',
      header: 'Other Fees',
      cell: ({ row }) => {
        const order = row.original
        return <div className='text-sm'>${order.cost.other.toFixed(2)}</div>
      },
      size: 100,
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='text-sm font-medium'>
            ${order.cost.total.toFixed(2)}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: () => {
        // TODO: Add warehouse field to schema or use placeholder
        return <div className='text-sm'>---</div>
      },
      size: 120,
    },
    {
      accessorKey: 'remark',
      header: 'Remark',
      cell: ({ row }) => {
        return <div className='text-sm'>{row.getValue('remark') || '---'}</div>
      },
      size: 150,
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
  ]
}
