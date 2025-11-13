import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Edit } from 'lucide-react'
import { type Store } from '../data/schema'

export const storesColumns: ColumnDef<Store>[] = [
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
      <DataTableColumnHeader column={column} title='Store Name' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.getValue('storeName')}</span>
        <Edit className='text-muted-foreground mt-1 h-3 w-3' />
      </div>
    ),
  },
  {
    accessorKey: 'storeId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store ID' />
    ),
    cell: ({ row }) => (
      <div className='text-sm'>{row.getValue('storeId')}</div>
    ),
  },
  {
    accessorKey: 'authorizationTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Authorization Time' />
    ),
    cell: ({ row }) => {
      const authTime = row.getValue('authorizationTime') as {
        date: string
        time: string
      }
      return (
        <div className='flex flex-col text-sm'>
          <span>{authTime.date}</span>
          <span className='text-muted-foreground'>{authTime.time}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Create Time' />
    ),
    cell: ({ row }) => {
      const createTime = row.getValue('createTime') as {
        date: string
        time: string
      }
      return (
        <div className='flex flex-col text-sm'>
          <span>{createTime.date}</span>
          <span className='text-muted-foreground'>{createTime.time}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'storeStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('storeStatus') as string
      return (
        <span className='text-green-600'>{status}</span>
      )
    },
  },
  {
    accessorKey: 'authorizationStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Authorization Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('authorizationStatus') as string
      return (
        <span className='text-green-600'>{status}</span>
      )
    },
  },
  {
    accessorKey: 'platformType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Platform Type' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('platformType')}</div>
    ),
  },
]

