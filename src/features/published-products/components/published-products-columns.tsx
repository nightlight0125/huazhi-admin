import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { type PublishedProduct } from '../data/schema'

export const publishedProductsColumns: ColumnDef<PublishedProduct>[] = [
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
            className='h-12 w-12 rounded object-cover shrink-0'
          />
          <div className='flex-1 min-w-0'>
            <div className='text-xs font-medium mb-1'>{product.name}</div>
            <div className='text-xs text-muted-foreground'>
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
        <div className='text-xs space-y-0.5'>
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
    accessorKey: 'shippingFrom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipping From' />
    ),
    cell: ({ row }) => {
      return <div className='text-xs'>{row.getValue('shippingFrom')}</div>
    },
  },
  {
    accessorKey: 'shippingMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipping Method' />
    ),
    cell: ({ row }) => {
      return <div className='text-xs'>{row.getValue('shippingMethod')}</div>
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      return (
        <div className='text-xs flex flex-col items-start gap-0.5'>
          <div>${amount.toFixed(2)}</div>
          <Info className='h-3 w-3 text-yellow-500' />
        </div>
      )
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

