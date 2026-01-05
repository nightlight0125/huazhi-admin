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
      const dateStr = row.getValue('registrationTime') as string
      // 如果已经是格式化的字符串，直接显示；否则尝试解析
      if (dateStr) {
        return <div className='text-sm'>{dateStr}</div>
      }
      return <div className='text-sm'>-</div>
    },
    filterFn: (row, id, value) => {
      if (!value || !value.from) return true
      const dateStr = row.getValue(id) as string
      if (!dateStr) return false

      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return false

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
