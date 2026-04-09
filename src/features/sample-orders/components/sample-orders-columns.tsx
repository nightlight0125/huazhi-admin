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
import { TRASH_DELETE_ICON_CLASS } from '@/lib/delete-action-ui'
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
import { toDisplayString } from '@/features/orders/utils'
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
        className='group h-8 px-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Trash2 className={cn(TRASH_DELETE_ICON_CLASS, 'h-4 w-4')} />
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

interface SampleOrderCancelCellProps {
  row: Row<SampleOrder>
  onCancel?: (orderId: string) => void | Promise<void>
}

function SampleOrderCancelCell({ row, onCancel }: SampleOrderCancelCellProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const order = row.original

  const handleConfirmCancel = async () => {
    if (!onCancel) return
    setIsLoading(true)
    try {
      await onCancel(order.id)
      setOpen(false)
    } catch (error) {
      console.error('取消订单失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='text-primary hover:text-primary dark:text-primary dark:hover:text-primary hover:bg-transparent dark:hover:bg-transparent'
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        Cancel
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!isLoading) {
            setOpen(newOpen)
          }
        }}
        handleConfirm={handleConfirmCancel}
        destructive
        isLoading={isLoading}
        title='Cancel order'
        desc={
          <>
            <p className='mb-2'>
              Are you sure to cancel this order?
              <br />
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
              Cancelling...
            </>
          ) : (
            'Confirm'
          )
        }
      />
    </>
  )
}

interface SampleOrderRestoreCellProps {
  row: Row<SampleOrder>
  onRestore?: (orderId: string) => void | Promise<void>
}

function SampleOrderRestoreCell({
  row,
  onRestore,
}: SampleOrderRestoreCellProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const order = row.original

  const handleConfirmRestore = async () => {
    if (!onRestore) return
    setIsLoading(true)
    try {
      await onRestore(order.id)
      setOpen(false)
    } catch (error) {
      console.error('恢复订单失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='text-primary hover:text-primary dark:text-primary dark:hover:text-primary hover:bg-transparent dark:hover:bg-transparent'
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        Restore
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!isLoading) {
            setOpen(newOpen)
          }
        }}
        handleConfirm={handleConfirmRestore}
        isLoading={isLoading}
        title='Restore order'
        desc={
          <>
            <p className='mb-2'>
              This order will return to awaiting payment. You can continue checkout
              after restoring.
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
              Restoring...
            </>
          ) : (
            'Restore'
          )
        }
      />
    </>
  )
}

export const createSampleOrdersColumns = (options?: {
  onPay?: (orderId: string) => void
  onCancel?: (orderId: string) => void
  onRestore?: (orderId: string) => void | Promise<void>
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void | Promise<void>
}): ColumnDef<SampleOrder>[] => {
  const { onPay, onCancel, onRestore, onEditAddress, onDelete } = options || {}

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
        const order = row.original as SampleOrder & {
          lingItems?: Array<{
            hzkj_product_name_en?:
              | { GLang?: string; zh_CN?: string }
              | string
              | null
            [key: string]: unknown
          }>
        }
        const firstProduct = order.productList?.[0]
        const firstLingItem = Array.isArray(order.lingItems)
          ? order.lingItems[0]
          : undefined
        const localSku = String(
          firstLingItem?.hzkj_local_sku ?? order.sku ?? ''
        )
        const productNameEn = firstLingItem?.hzkj_product_name_en
        const variantLabel =
          typeof productNameEn === 'string'
            ? productNameEn
            : productNameEn?.GLang || productNameEn?.zh_CN || 'xxxx'
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
                  <div>{localSku || '---'}</div>
                  <div className='whitespace-normal'>
                    Variant: {variantLabel}
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
        const order = row.original as SampleOrder & {
          hzkj_total_amount?: number
          hzkj_fre_quo_amount?: number
          totalQty?: number
        }
        const total =
          order.hzkj_total_amount ??
          order.hzkj_order_amount ??
          order.cost?.total ??
          0
        const product = order.hzkj_order_amount ?? order.cost?.product ?? 0
        const shipping = order.hzkj_fre_quo_amount ?? order.cost?.shipping ?? 0
        const qty = order.totalQty ?? order.cost?.qty ?? 0
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='cursor-default space-y-1 text-sm'>
                <div>Total: ${Number(total).toFixed(2)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className='space-y-0.5 text-xs'>
              <div>Product: ${Number(product).toFixed(2)}</div>
              <div>Shipping: ${Number(shipping).toFixed(2)}</div>
              <div>Qty: {qty}</div>
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
      header: 'Tracking No',
      cell: ({ row }) => {
        const order = row.original
        const rawTracking = toDisplayString((order as any).trackingNumber)
        const trackingNumbers = rawTracking
          ? rawTracking
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : []

        if (trackingNumbers.length === 0) {
          return <div className='text-sm'>---</div>
        }

        return (
          <div className='space-y-1 text-sm'>
            {trackingNumbers.map((trackingNo, index) => (
              <div key={`${trackingNo}-${index}`}>
                <a
                  href={`https://t.17track.net/zh-cn#nums=${encodeURIComponent(trackingNo)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                  onClick={(e) => e.stopPropagation()}
                >
                  {trackingNo}
                </a>
              </div>
            ))}
          </div>
        )
      },
      size: 180,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const order = row.original as any
        // 0=取消，1=待支付，2=已支付，3=处理中，4=已发货
        const orderStatus = order.hzkj_orderstatus
        // 状态映射
        const statusMap: Record<string, { label: string; color: string }> = {
          no: {
            label: 'Unconnected',
            color:
              'border-transparent bg-amber-500 text-white dark:bg-amber-500/25 dark:text-amber-400',
          },
          '0': {
            label: 'Cancelled',
            color:
              'border-transparent bg-red-500 text-white dark:bg-red-500/25 dark:text-red-400',
          },
          '1': {
            label: 'Pending',
            color:
              'border-transparent bg-orange-500 text-white dark:bg-orange-500/25 dark:text-orange-400',
          },
          '2': {
            label: 'Paid',
            color:
              'border-transparent bg-green-500 text-white dark:bg-green-500/25 dark:text-green-400',
          },
          '3': {
            label: 'Processing',
            color:
              'border-transparent bg-purple-500 text-white dark:bg-purple-500/25 dark:text-purple-400',
          },
          '4': {
            label: 'Shipped',
            color:
              'border-transparent bg-blue-500 text-white dark:bg-blue-500/25 dark:text-blue-400',
          },
        }

        const statusKey = String(orderStatus ?? '').toLowerCase()
        const statusInfo =
          orderStatus != null && orderStatus !== '' && statusMap[statusKey]
            ? statusMap[statusKey]
            : {
                label: '---',
                color: 'border-transparent bg-muted text-muted-foreground',
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
        const orderStatus = (order as any).hzkj_orderstatus
        const normalizedStatus = String(orderStatus ?? '').toLowerCase()
        const isUnconnected = normalizedStatus === 'no'
        const isPendingPayment = normalizedStatus === '1'
        const isCancelledOrder = normalizedStatus === '0'
        const isPaidOrDone =
          normalizedStatus === '2' ||
          normalizedStatus === '3' ||
          normalizedStatus === '4'
        const showPay = isUnconnected || isPendingPayment

        if (isPaidOrDone) {
          return <div className='flex items-center gap-2' />
        }
        return (
          <div
            className='flex items-center gap-2'
            onClick={(e) => e.stopPropagation()}
          >
            {isCancelledOrder ? (
              <>
                {onRestore ? (
                  <SampleOrderRestoreCell row={row} onRestore={onRestore} />
                ) : null}
                <SampleOrderDeleteCell row={row} onDelete={onDelete} />
              </>
            ) : showPay ? (
              <>
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
                {isPendingPayment && onCancel ? (
                  <SampleOrderCancelCell row={row} onCancel={onCancel} />
                ) : null}
              </>
            ) : null}
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
