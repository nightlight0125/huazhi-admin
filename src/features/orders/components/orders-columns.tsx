import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Order } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

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
      <DataTableColumnHeader column={column} title='客户' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('customerName')}</div>
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

// 为了向后兼容，导出默认的列定义
export const ordersColumns = createOrdersColumns()
