import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type RecommendedListRecord } from '../data/schema'

export const recommendedListColumns: ColumnDef<RecommendedListRecord>[] = [
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
    accessorKey: 'referee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Referee' />
    ),
    cell: ({ row }) => {
      return <div className='text-sm'>{row.getValue('referee')}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'registrationTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registration Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('registrationTime') as Date
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
    accessorKey: 'commissionAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Commission Amount' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('commissionAmount') as number
      return <div className='text-sm'>{amount.toFixed(2)} USD</div>
    },
    enableSorting: false,
  },
]

