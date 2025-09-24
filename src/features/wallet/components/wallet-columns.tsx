import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { walletRecordStatuses } from '../data/data'
import { type WalletRecord } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const createWalletColumns = (): ColumnDef<WalletRecord>[] => [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='记录ID' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('id')}</div>
    ),
  },
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='客户订单号' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('orderNumber')}</div>
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
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='金额' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      const record = row.original
      const isRecharge = record.type === 'recharge'
      
      return (
        <div className={`font-medium ${isRecharge ? 'text-green-600' : 'text-blue-600'}`}>
          {isRecharge ? '+' : '-'}{new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
          }).format(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类型' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const isRecharge = type === 'recharge'
      
      return (
        <Badge variant={isRecharge ? 'default' : 'secondary'}>
          {isRecharge ? '充值记录' : '发票记录'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = walletRecordStatuses.find(
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
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='支付方式' />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.getValue('paymentMethod') as string
      const record = row.original
      
      if (record.type !== 'recharge' || !paymentMethod) {
        return <span className='text-muted-foreground'>-</span>
      }
      
      return <div className='text-sm'>{paymentMethod}</div>
    },
  },
  {
    accessorKey: 'transactionId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='交易ID' />
    ),
    cell: ({ row }) => {
      const transactionId = row.getValue('transactionId') as string
      const record = row.original
      
      if (record.type !== 'recharge' || !transactionId) {
        return <span className='text-muted-foreground'>-</span>
      }
      
      return <div className='font-mono text-sm'>{transactionId}</div>
    },
  },
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发票号' />
    ),
    cell: ({ row }) => {
      const invoiceNumber = row.getValue('invoiceNumber') as string
      const record = row.original
      
      if (record.type !== 'invoice' || !invoiceNumber) {
        return <span className='text-muted-foreground'>-</span>
      }
      
      return <div className='font-mono text-sm'>{invoiceNumber}</div>
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-sm'>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='text-sm'>
          {new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(date)}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

// 为了向后兼容，导出默认的列定义
export const walletColumns = createWalletColumns()
