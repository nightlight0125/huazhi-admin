import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type WithdrawRecord } from '../data/schema'

export const withdrawRecordsColumns: ColumnDef<WithdrawRecord>[] = [
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
    accessorKey: 'account',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Account' />
    ),
    cell: ({ row }) => {
      return <div className='text-sm'>{row.getValue('account')}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'accountType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Account Type' />
    ),
    cell: ({ row }) => {
      return <div className='text-sm'>{row.getValue('accountType')}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      return <div className='text-sm'>${amount.toFixed(2)}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'dateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('dateTime') as Date
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return (
        <div className='text-sm'>
          {year}/{month}/{day} {hours}:{minutes}:{seconds}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || !value.from) return true
      const date = row.getValue(id) as Date
      const from = value.from
      const to = value.to || value.from
      
      // Set time to start of day for from and end of day for to
      const fromDate = new Date(from)
      fromDate.setHours(0, 0, 0, 0)
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      
      return date >= fromDate && date <= toDate
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusLower = status.toLowerCase()
      
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
      let className = ''
      
      if (statusLower === 'pending' || statusLower === 'processing') {
        variant = 'secondary'
        className = 'bg-orange-500 text-white border-transparent'
      } else if (statusLower === 'completed') {
        variant = 'default'
        className = 'bg-green-500 text-white border-transparent'
      } else if (statusLower === 'failed') {
        variant = 'destructive'
        className = 'bg-red-500 text-white border-transparent'
      } else {
        className = 'bg-gray-200 text-gray-700 border-transparent'
      }
      
      return (
        <Badge variant={variant} className={className}>
          {status}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'remarks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remarks' />
    ),
    cell: ({ row }) => {
      const remarks = row.getValue('remarks') as string | undefined
      return <div className='text-sm'>{remarks || '-'}</div>
    },
    enableSorting: false,
  },
]

