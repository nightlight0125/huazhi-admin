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
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-sm font-medium'>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='充值方式' />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.getValue('paymentMethod') as string
      return (
        <div className='text-sm'>
          {paymentMethod || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='日期' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('date') as Date
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
    accessorKey: 'cashback',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='返现' />
    ),
    cell: ({ row }) => {
      const cashback = row.getValue('cashback') as number | undefined
      if (!cashback) {
        return <span className='text-muted-foreground'>-</span>
      }
      
      return (
        <div className='font-medium text-green-600'>
          +{new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
          }).format(cashback)}
        </div>
      )
    },
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='备注' />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | undefined
      if (!notes) {
        return <span className='text-muted-foreground'>-</span>
      }
      
      return (
        <div className='max-w-[200px] truncate text-sm text-muted-foreground'>
          {notes}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='充值状态' />
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

// 为了向后兼容，导出默认的列定义
export const walletColumns = createWalletColumns()
