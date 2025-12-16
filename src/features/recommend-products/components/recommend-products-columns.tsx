import { type ColumnDef } from '@tanstack/react-table'
import { Store, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type RecommendProduct } from '../data/schema'

export const recommendProductsColumns: ColumnDef<RecommendProduct>[] = [
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
            className='h-12 w-12 shrink-0 rounded object-cover'
          />
          <div className='min-w-0 flex-1'>
            <div className='flex items-start gap-1'>
              <p className='line-clamp-2 text-xs leading-tight'>
                {product.description}
              </p>
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
        <div className='text-xs font-medium text-green-600'>
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
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2 text-xs'
            onClick={(e) => {
              e.stopPropagation()
              console.log('Publish recommend product to store:', product.id)
              // TODO: 在这里调用发布到店铺的接口
            }}
          >
            <Store className='mr-1 h-3.5 w-3.5' />
            Publish
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 border-red-200 px-2 text-xs text-red-500'
            onClick={(e) => {
              e.stopPropagation()
              console.log('Delete recommend product:', product.id)
              // TODO: 在这里调用删除推荐商品的接口
            }}
          >
            <Trash2 className='mr-1 h-3.5 w-3.5' />
          </Button>
        </div>
      )
    },
  },
]
