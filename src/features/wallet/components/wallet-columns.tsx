import { type ColumnDef } from '@tanstack/react-table'
import { Download, Eye, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { walletRecordStatuses } from '../data/data'
import { type WalletRecord } from '../data/schema'

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
      <DataTableColumnHeader column={column} title='description' />
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
      <DataTableColumnHeader column={column} title='paymentMethod' />
    ),
    cell: ({ row }) => {
      const paymentMethod = row.getValue('paymentMethod') as string
      return <div className='text-sm'>{paymentMethod || '-'}</div>
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='date' />
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
      <DataTableColumnHeader column={column} title='amount' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      const record = row.original
      const isRecharge = record.type === 'recharge'

      return (
        <div
          className={`font-medium ${isRecharge ? 'text-green-600' : 'text-blue-600'}`}
        >
          {isRecharge ? '+' : '-'}
          {new Intl.NumberFormat('zh-CN', {
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
      <DataTableColumnHeader column={column} title='cashback' />
    ),
    cell: ({ row }) => {
      const cashback = row.getValue('cashback') as number | undefined
      if (!cashback) {
        return <span className='text-muted-foreground'>-</span>
      }

      return (
        <div className='font-medium text-green-600'>
          +
          {new Intl.NumberFormat('zh-CN', {
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
      <DataTableColumnHeader column={column} title='notes' />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | undefined
      if (!notes) {
        return <span className='text-muted-foreground'>-</span>
      }

      return (
        <div className='text-muted-foreground max-w-[200px] truncate text-sm'>
          {notes}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='status' />
    ),
    cell: ({ row }) => {
      const status = walletRecordStatuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      // 状态样式映射
      const statusClassNameMap: Record<string, string> = {
        pending:
          'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
        completed:
          'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white',
        failed:
          'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white',
        cancelled:
          'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      }

      const statusClassName =
        statusClassNameMap[status.value] ||
        'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'

      return (
        <div className='flex w-[100px] items-center gap-2'>
          <Badge variant='outline' className={statusClassName}>
            {status.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const record = row.original

      return (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2 text-xs'
            onClick={(e) => {
              e.stopPropagation()
              console.log('View wallet record details:', record.id)
              // TODO: 在这里打开详情对话框或侧边栏
            }}
          >
            <Eye className='mr-1 h-3.5 w-3.5' />
          </Button>

          {record.type === 'invoice' && record.invoiceUrl && (
            <Button
              variant='outline'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                console.log(
                  'Download invoice:',
                  record.invoiceNumber || record.id
                )
                // TODO: 在这里触发发票下载
              }}
            >
              <Download className='mr-1 h-3.5 w-3.5' />
              Invoice
            </Button>
          )}

          {record.type === 'recharge' && (
            <Button
              variant='outline'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                console.log(
                  'View recharge transaction:',
                  record.transactionId || record.id
                )
                // TODO: 在这里查看充值交易详情
              }}
            >
              <FileText className='mr-1 h-3.5 w-3.5' />
              Trans
            </Button>
          )}
        </div>
      )
    },
  },
]

// 为了向后兼容，导出默认的列定义
export const walletColumns = createWalletColumns()
