import { useState } from 'react'
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import {
  CreditCard,
  Edit,
  Image as ImageIcon,
  Loader2,
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

  console.log('order', order)

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
              Order Number: <strong>{order.billno}</strong>
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
        const billno = order.billno || order.orderNumber
        const createtime = order.createtime
        const date = createtime ? new Date(createtime) : order.createdAt
        return (
          <div>
            <div className='font-medium'>{billno}</div>
            <div className='text-sm'>
              {date ? format(date, 'MM-dd-yyyy') : '---'}
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
        const total = order.hzkj_order_amount ?? order.cost.total
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='cursor-default space-y-1 text-sm'>
                <div>Total: ${total.toFixed(2)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className='space-y-0.5 text-xs'>
              {/* <div>Product: {order.cost.product.toFixed(2)}</div>
              <div>Shipping: {order.cost.shipping.toFixed(2)}</div>
              <div>Other: {order.cost.other.toFixed(2)}</div>
              <div>Qty: {order.cost.qty}</div> */}
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
        const customerName = order.hzkj_customer_name?.GLang || '---'
        return (
          <div className='space-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              <span> {customerName}</span>
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
            <div>{order.hzkj_country_code || order.address.country}</div>
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
            <div>{order.trackingNumber || '---'}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const order = row.original as any
        // 使用后端返回的 hzkj_orderstatus 字段
        // 0=取消，1=待支付，2=已支付，3=处理中，4=已发货
        const orderStatus = order.hzkj_orderstatus
        // 状态映射
        const statusMap: Record<string, { label: string; color: string }> = {
          '0': {
            label: '取消',
            color:
              'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-red-500',
          },
          '1': {
            label: '待支付',
            color:
              'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-orange-500',
          },
          '2': {
            label: '已支付',
            color:
              'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-green-500',
          },
          '3': {
            label: '处理中',
            color:
              'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-purple-500',
          },
          '4': {
            label: '已发货',
            color:
              'border-transparent bg-blue-500 text-white dark:bg-blue-500 dark:text-blue-500',
          },
        }

        const statusInfo =
          orderStatus && statusMap[String(orderStatus)]
            ? statusMap[String(orderStatus)]
            : {
                label: '---',
                color:
                  'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
              }

        return (
          <div className='space-y-1'>
            <Badge variant='outline' className={statusInfo.color}>
              {statusInfo.label}
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
