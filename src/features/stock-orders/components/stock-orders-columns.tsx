import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { CreditCard, Image as ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type StockOrder } from '../data/schema'

export const createStockOrdersColumns = (options?: {
  onPay?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void
}): ColumnDef<StockOrder>[] => {
  const { onPay, onDelete } = options || {}

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
        return (
          <div className='text-sm font-medium text-green-600'>
            ${order.cost.product.toFixed(2)}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'amount',
      header: ' Total Amount',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='text-sm font-medium text-green-600'>
            ${order.cost.total.toFixed(2)}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => {
        const { address, shippingMethod } = row.original
        // 使用地址国家 + 物流方式 拼出一个“仓库”展示文案，作为假数据
        const warehouseLabel = `${address.country} · ${shippingMethod}`
        return <div className='text-sm'>{warehouseLabel}</div>
      },
      size: 120,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusColors: Record<string, string> = {
          paid: 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white',
          shipped:
            'border-transparent bg-blue-500 text-white dark:bg-blue-500 dark:text-white',
          pending:
            'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
          processing:
            'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-white',
          completed:
            'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          canceled:
            'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white',
          quoting:
            'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
          pay_in_progress:
            'border-transparent bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white',
        }
        return (
          <div className='space-y-1'>
            <Badge
              variant='outline'
              className={
                statusColors[status] ||
                'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }
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
          <div
            className='flex items-center gap-2'
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant='ghost'
              size='sm'
              className='text-primary hover:text-primary dark:text-primary dark:hover:text-primary hover:bg-transparent dark:hover:bg-transparent'
              onClick={() => {
                onPay?.(order.id)
              }}
            >
              <CreditCard className='h-4 w-4' />
              Pay
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 px-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300'
              onClick={() => {
                onDelete?.(order.id)
              }}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      size: 150,
    },
    {
      id: 'productName',
      accessorFn: (row) => row.productList?.[0]?.productName || '',
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      size: 0,
    },
  ]
}
