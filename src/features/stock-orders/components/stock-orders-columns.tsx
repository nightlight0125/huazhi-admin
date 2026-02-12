import { useState } from 'react'
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { CreditCard, ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type StockOrder } from '../data/schema'

// 删除订单单元格组件
interface StockOrderDeleteCellProps {
  row: Row<StockOrder>
  onDelete?: (orderId: string) => void | Promise<void>
}

function StockOrderDeleteCell({ row, onDelete }: StockOrderDeleteCellProps) {
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
        title={<span className='text-destructive'>Delete Stock Order</span>}
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this stock order?
              <br />
              This action cannot be undone.
            </p>
            <p className='text-muted-foreground text-sm'>
              Order Number:{' '}
              <strong>{order.billno || order.orderNumber || '---'}</strong>
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
        const order = row.original as any
        return (
          <div className='font-medium'>{order.billno || order.orderNumber}</div>
        )
      },
      size: 120,
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: ({ row }) => {
        const order = row.original as any
        const hzkjPicture = order.hzkj_picture

        return (
          <div className='flex items-center gap-2 pr-8'>
            {hzkjPicture ? (
              <img
                src={hzkjPicture}
                className='h-10 w-10 rounded object-cover'
              />
            ) : (
              <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded'>
                <ImageIcon className='text-muted-foreground h-5 w-5' />
              </div>
            )}
            <div className='text-sm'>
              <div className='font-medium'>{order.hzkj_product_name_en}</div>
            </div>
          </div>
        )
      },
      size: 180,
    },
    {
      accessorKey: 'createdAt',
      header: 'Creat Time',
      cell: ({ row }) => {
        const order = row.original as any
        return (
          <div className='text-sm'>
            {order.createtime
              ? format(new Date(order.createtime), 'MM-dd-yyyy')
              : '---'}
          </div>
        )
      },
      size: 120,
    },
    {
      id: 'qty',
      header: 'QTY',
      cell: ({ row }) => {
        const order = row.original as any
        return <div className='text-sm'>{order.hzkj_qty || 0}</div>
      },
      size: 80,
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const order = row.original as any
        const price = order.hzkj_shop_price
          ? typeof order.hzkj_shop_price === 'string'
            ? parseFloat(order.hzkj_shop_price) || 0
            : typeof order.hzkj_shop_price === 'number'
              ? order.hzkj_shop_price
              : 0
          : 0

        return (
          <div className='text-sm font-medium text-green-600'>
            ${price.toFixed(2)}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'amount',
      header: ' Total Amount',
      cell: ({ row }) => {
        const order = row.original as any
        const amount = order.hzkj_order_amount
          ? typeof order.hzkj_order_amount === 'string'
            ? parseFloat(order.hzkj_order_amount) || 0
            : typeof order.hzkj_order_amount === 'number'
              ? order.hzkj_order_amount
              : 0
          : 0

        return (
          <div className='text-sm font-medium text-green-600'>
            ${amount.toFixed(2)}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => {
        const order = row.original as any
        return (
          <div className='text-sm'>
            {order.hzkj_warehouse_name?.GLang || '---'}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const order = row.original as any
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
            <StockOrderDeleteCell row={row} onDelete={onDelete} />
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
