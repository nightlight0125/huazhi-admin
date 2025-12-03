import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type PublishedProduct } from '../data/schema'

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
          <div>TD: ${product.tdPrice.toFixed(2)}</div>
          <div>Your: {product.yourPrice}</div>
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
    id: 'actions',
    header: () => <div className='text-xs font-medium'>Action</div>,
    cell: ({ row }) => {
      return (
        <Button
          variant='outline'
          size='sm'
          className='h-7 text-xs'
          onClick={() => {
            console.log('Delete:', row.original.id)
          }}
        >
          Delete
        </Button>
      )
    },
    enableSorting: false,
  },
]
