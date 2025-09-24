import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Eye } from 'lucide-react'
import { 
  orderStatuses, 
  platformOrderStatuses, 
  platformFulfillmentStatuses, 
} from '../data/data'
import { type Order } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { OrdersProductDetailsDialog } from './orders-product-details-dialog'

export const createOrdersColumns = (): ColumnDef<Order>[] => [
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
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'storeName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='店铺名称' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('storeName')}</div>
    ),
  },
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='订单号' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('orderNumber')}</div>
    ),
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='客户名称' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('customerName')}</div>
    ),
  },
  {
    accessorKey: 'country',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='国家' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('country')}</div>
    ),
  },
  {
    accessorKey: 'province',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='省/州' />
    ),
    cell: ({ row }) => (
      <div className='text-sm'>{row.getValue('province')}</div>
    ),
  },
  {
    accessorKey: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='城市' />
    ),
    cell: ({ row }) => (
      <div className='text-sm'>{row.getValue('city')}</div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='电话号码' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('phoneNumber')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='电子邮件' />
    ),
    cell: ({ row }) => (
      <div className='text-sm'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'trackingNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='跟踪号' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('trackingNumber')}</div>
    ),
  },
  {
    accessorKey: 'shippingCost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='运费' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('shippingCost'))
      const formatted = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'otherCosts',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='其他费用' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('otherCosts'))
      const formatted = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'totalCost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='总成本' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalCost'))
      const formatted = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
      }).format(amount)
      return <div className='font-bold text-primary'>{formatted}</div>
    },
  },
  {
    accessorKey: 'shippingStock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipping Stock' />
    ),
    cell: ({ row }) => {
      const stock = row.getValue('shippingStock') as string
      const variant = stock === '有库存' ? 'default' : stock === '缺货' ? 'destructive' : 'secondary'
      return <Badge variant={variant}>{stock}</Badge>
    },
  },
  {
    accessorKey: 'productList',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品列表' />
    ),
    cell: ({ row }) => {
      const productList = row.getValue('productList') as any[]
      const [showDetails, setShowDetails] = useState(false)
      
      return (
        <>
          <div className='max-w-48'>
            <div className='text-sm font-medium mb-1'>
              共 {productList.length} 个产品
            </div>
            <div className='space-y-1'>
              {productList.slice(0, 2).map((product) => (
                <div key={product.id} className='text-xs text-muted-foreground'>
                  {product.productName} x{product.quantity}
                </div>
              ))}
              {productList.length > 2 && (
                <div className='text-xs text-muted-foreground'>
                  ...还有 {productList.length - 2} 个产品
                </div>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 text-xs mt-2'
              onClick={() => setShowDetails(true)}
            >
              <Eye className='h-3 w-3 mr-1' />
              查看详情
            </Button>
          </div>
          
          <OrdersProductDetailsDialog
            open={showDetails}
            onOpenChange={setShowDetails}
            order={row.original}
          />
        </>
      )
    },
  },
  {
    accessorKey: 'country',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='国家' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('country')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='订单状态' />
    ),
    cell: ({ row }) => {
      const status = orderStatuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          {status.icon && (
            <status.icon className='text-muted-foreground size-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'platformOrderStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='平台订单状态' />
    ),
    cell: ({ row }) => {
      const status = platformOrderStatuses.find(
        (status) => status.value === row.getValue('platformOrderStatus')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          {status.icon && (
            <status.icon className='text-muted-foreground size-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'platformFulfillmentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='平台履行状态' />
    ),
    cell: ({ row }) => {
      const status = platformFulfillmentStatuses.find(
        (status) => status.value === row.getValue('platformFulfillmentStatus')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          {status.icon && (
            <status.icon className='text-muted-foreground size-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

// 为了向后兼容，导出默认的列定义
export const ordersColumns = createOrdersColumns()
