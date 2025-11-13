import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { type StoreProduct } from '../data/schema'
import { EditableSelectCell } from './editable-select-cell'

const shippingFromOptions = ['选项1', '选项2', '选项3', '选项4']
const shippingMethodOptions = [
  '请选择',
  'Standard Shipping',
  'Express Shipping',
  'TDPacket Electro',
]

export const storeProductsColumns: ColumnDef<StoreProduct>[] = [
  {
    accessorKey: 'image',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => {
      const image = row.getValue('image') as string
      return (
        <div className='flex items-center'>
          <img
            src={image}
            alt={row.original.name}
            className='h-12 w-12 rounded object-cover'
          />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='max-w-[200px]'>
          <span className='text-xs'>{row.getValue('name')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'storePrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('storePrice') as number
      return (
        <div className='text-xs font-medium text-orange-500'>
          ${price.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: 'hzPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='HZ Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('hzPrice') as number | null
      return (
        <div className='text-xs'>{price ? `$${price.toFixed(2)}` : '—'}</div>
      )
    },
  },
  {
    accessorKey: 'shippingFrom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipping From' />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <EditableSelectCell
          value={product.shippingFrom}
          options={shippingFromOptions}
          className='h-8 w-[120px] text-xs'
          onValueChange={(value) => {
            // Handle value change - you can update the data here
            console.log('Shipping From changed:', value, product.id)
          }}
        />
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'shippingMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipping Method' />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <EditableSelectCell
          value={product.shippingMethod}
          options={shippingMethodOptions}
          placeholder='请选择'
          className='h-8 w-[140px] text-xs'
          onValueChange={(value) => {
            // Handle value change - you can update the data here
            console.log('Shipping Method changed:', value, product.id)
          }}
        />
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
    id: 'actions',
    header: () => <div className='text-xs font-medium'>Action</div>,
    cell: ({ row }) => {
      return (
        <div className='flex flex-col gap-1'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => {
              console.log('Connect Products:', row.original.id)
            }}
          >
            Connect Products
          </Button>
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
        </div>
      )
    },
    enableSorting: false,
  },
]
