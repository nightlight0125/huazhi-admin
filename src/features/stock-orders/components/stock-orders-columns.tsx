import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type StockOrder } from '../data/schema'
import { StockOrdersRowActions } from './stock-orders-row-actions'

export const createStockOrdersColumns = (options?: {
  onPay?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void
}): ColumnDef<StockOrder>[] => {
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
      id: 'otherFees',
      header: 'Other Fees',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='text-sm font-medium text-green-600'>
            ${order.cost.other.toFixed(2)}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'amount',
      header: 'Amount',
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
      minSize: 60,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusColors: Record<string, string> = {
          paid: 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white',
          shipped: 'border-transparent bg-blue-500 text-white dark:bg-blue-500 dark:text-white',
          pending: 'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
          processing: 'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-white',
          completed: 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          canceled: 'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white',
          quoting: 'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
          pay_in_progress: 'border-transparent bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white',
        }
        return (
          <div className='space-y-1'>
            <Badge
              variant='outline'
              className={statusColors[status] || 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
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
      cell: ({ row }) => (
        <StockOrdersRowActions
          row={row}
          onPay={onPay}
          onEditAddress={onEditAddress}
          onAddPackage={onAddPackage}
          onDelete={onDelete}
        />
      ),
      enableSorting: false,
      size: 80,
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
