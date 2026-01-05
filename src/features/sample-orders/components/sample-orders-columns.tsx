import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { CreditCard, Edit, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
import { type SampleOrder } from '../data/schema'

// 删除订单单元格组件
interface SampleOrderDeleteCellProps {
  row: Row<SampleOrder>
  onDelete?: (orderId: string) => void | Promise<void>
}

function SampleOrderDeleteCell({ row, onDelete }: SampleOrderDeleteCellProps) {
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
        <Trash2 className='h-4 w-4' />
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
        title={<span className='text-destructive'>Delete Sample Order</span>}
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this sample order?
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

export const createSampleOrdersColumns = (options?: {
  onPay?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void | Promise<void>
}): ColumnDef<SampleOrder>[] => {
  const { onPay, onEditAddress, onDelete } = options || {}

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
        return (
          <div>
            <div className='font-medium'>{order.orderNumber}</div>
            <div className='text-sm'>
              {format(new Date(order.createdAt), 'MM-dd-yyyy')}
            </div>
          </div>
        )
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
          <div className='max-w-[200px]'>
            {firstProduct && (
              <div className='flex items-start gap-2'>
                {firstProduct.productImageUrl ? (
                  <img
                    src={firstProduct.productImageUrl}
                    alt={firstProduct.productName}
                    className='h-16 w-16 shrink-0 rounded object-cover'
                  />
                ) : (
                  <div className='bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded'>
                    <ImageIcon className='text-muted-foreground h-8 w-8' />
                  </div>
                )}
                <div className='min-w-0 flex-1 text-sm leading-snug break-words'>
                  <div>{order.sku}</div>
                  <div className='whitespace-normal'>
                    Variant:{' '}
                    {firstProduct.productVariant
                      ?.map((v) => ` ${v.value}`)
                      .join(', ') || 'xxxx'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      },
      size: 200,
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
                <div>Total: ${order.cost.total.toFixed(2)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className='space-y-0.5 text-xs'>
              <div>Product: ${order.cost.product.toFixed(2)}</div>
              <div>Shipping: ${order.cost.shipping.toFixed(2)}</div>
              <div>Other: ${order.cost.other.toFixed(2)}</div>
              <div>Qty: {order.cost.qty}</div>
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 150,
    },
    {
      id: 'address',
      header: 'Address',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              <span> {order.address.name}</span>
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
      header: 'Tracking No.',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className='space-y-1 text-sm'>
            <div>{order.trackId || '---'}</div>
          </div>
        )
      },
      size: 150,
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
            <SampleOrderDeleteCell row={row} onDelete={onDelete} />
          </div>
        )
      },
      enableSorting: false,
      size: 120,
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
