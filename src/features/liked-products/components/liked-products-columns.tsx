import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { Eye, Trash2 } from 'lucide-react'
import { type LikedProduct } from '../data/schema'

export const likedProductsColumns: ColumnDef<LikedProduct>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className='flex items-start gap-2'>
          <img
            src={product.image}
            alt={product.name}
            className='h-12 w-12 rounded object-cover shrink-0'
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-start gap-1'>
              <p className='text-xs leading-tight line-clamp-2'>
                {product.description}
              </p>
              <Eye className='h-3 w-3 shrink-0 text-gray-400 mt-0.5' />
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'spu',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SPU' />
    ),
    cell: ({ row }) => (
      <div className='text-xs font-medium'>{row.getValue('spu')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'priceMin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className='text-xs'>
          {product.priceMin.toFixed(2)}-{product.priceMax.toFixed(2)}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'addDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Add Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('addDate') as Date
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
    header: () => <div className='text-xs font-medium'>Operate</div>,
    cell: ({ row }) => {
      return (
        <Button
          variant='link'
          size='sm'
          className='h-auto p-0 text-xs text-blue-600 hover:text-blue-700'
          onClick={() => {
            // Handle delete action
            console.log('Delete product:', row.original.id)
          }}
        >
          <Trash2 className='mr-1 h-3 w-3' />
          Delete
        </Button>
      )
    },
  },
]

