import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type PublishedProduct } from '../data/schema'
import { PublishedProductsRowActions } from './published-products-row-actions'

export const publishedProductsColumns: ColumnDef<PublishedProduct>[] = [
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
    accessorKey: 'products',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Products' />
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
            <div className='mb-1 text-xs font-medium'>{product.name}</div>
            <div className='text-muted-foreground text-xs'>
              SPU: {product.spu}
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'storeName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Name' />
    ),
    cell: ({ row }) => {
      return <div className='text-xs'>{row.getValue('storeName')}</div>
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className='space-y-0.5 text-xs'>
          <div className='font-medium text-green-600'>
            HZ:${product.tdPrice.toFixed(2)}
          </div>
          <div className='font-medium text-green-600'>
            Your: {product.yourPrice}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'weight',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Weight(g)' />
    ),
    cell: ({ row }) => {
      const weight = row.getValue('weight') as number
      return <div className='text-xs'>{weight}</div>
    },
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reason' />
    ),
    cell: ({ row }) => {
      const product = row.original
      if (product.status !== 'failed') {
        return <div className='text-muted-foreground text-xs'>-</div>
      }
      // 这里可以根据真实数据返回失败原因，目前先使用占位文案
      return (
        <div className='text-xs text-red-500'>
          Sync failed. Please check store configuration.
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ row }) => {
      const product = row.original
      const time = product.updatedAt ?? product.createdAt
      if (!time) {
        return <div className='text-muted-foreground text-xs'>-</div>
      }
      const dateStr = time.toLocaleDateString()
      const timeStr = time.toLocaleTimeString()
      return (
        <div className='flex flex-col text-xs'>
          <span>{dateStr}</span>
          <span className='text-muted-foreground'>{timeStr}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <PublishedProductsRowActions row={row} />,
    enableSorting: false,
  },
]
