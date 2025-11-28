import { type ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { sourcingStatuses } from '../data/data'
import { type Sourcing } from '../data/schema'

export const sourcingColumns: ColumnDef<Sourcing>[] = [
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
    accessorKey: 'sourcingId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sourcing ID' />
    ),
    cell: ({ row }) => (
      <div className='text-xs font-medium'>{row.getValue('sourcingId')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL/Images' />
    ),
    cell: ({ row }) => {
      const sourcing = row.original
      return (
        <div className='flex items-start gap-2'>
          {sourcing.images && sourcing.images.length > 0 && (
            <div className='flex gap-1'>
              {sourcing.images.slice(0, 2).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className='h-10 w-10 rounded object-cover'
                />
              ))}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <div className='flex items-start gap-1'>
              <p className='line-clamp-3 text-[10px] leading-tight'>
                {sourcing.productName}
              </p>
              <Eye className='mt-0.5 h-3 w-3 shrink-0 text-gray-400' />
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = sourcingStatuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      const statusColors: Record<string, string> = {
        processing: 'text-purple-600',
        completed: 'text-green-600',
        failed: 'text-red-600',
      }

      return (
        <div className='flex items-center gap-1'>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              statusColors[status.value] || 'text-gray-600'
            }`}
            style={{
              backgroundColor:
                status.value === 'processing'
                  ? '#9333ea'
                  : status.value === 'completed'
                    ? '#16a34a'
                    : '#dc2626',
            }}
          />
          <span className='text-xs'>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'result',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Result' />
    ),
    cell: ({ row }) => {
      const result = row.getValue('result') as string | undefined
      return <div className='text-xs'>{result || '-'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remark' />
    ),
    cell: ({ row }) => {
      const remark = row.getValue('remark') as string | undefined
      return <div className='text-xs'>{remark || ''}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdTime') as Date
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      const year = date.getFullYear()
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      return (
        <div className='text-xs'>
          {month}. {day}, {year} {time}
        </div>
      )
    },
  },
  {
    accessorKey: 'resultTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Result Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('resultTime') as Date | undefined
      if (!date) return <div className='text-xs'>-</div>
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      const year = date.getFullYear()
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      return (
        <div className='text-xs'>
          {month}. {day}, {year} {time}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className='text-xs font-medium'>Operation</div>,
    cell: ({ row }) => {
      return (
        <>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => {
              // Handle connect HZ product action
              console.log('Connect HZ Product:', row.original.sourcingId)
            }}
          >
            Connect HZ Product
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => {
              console.log('Delete:', row.original.sourcingId)
            }}
          >
            Delete
          </Button>
        </>
      )
    },
  },
]
