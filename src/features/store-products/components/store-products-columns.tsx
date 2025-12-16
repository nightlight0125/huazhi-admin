import { type ColumnDef } from '@tanstack/react-table'
import { Link2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

type ColumnOptions = {
  onConnectProducts?: (productId: string) => void
}

export const createStoreProductsColumns = (
  options?: ColumnOptions
): ColumnDef<StoreProduct>[] => [
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
        <div className='text-xs font-medium text-green-600'>
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
        <div className='text-xs font-medium text-green-600'>
          {price ? `$${price.toFixed(2)}` : '—'}
        </div>
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
    accessorKey: 'associateStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Associate Status' />
    ),
    cell: ({ row }) => {
      const value = (row.getValue('associateStatus') as string) || '-'
      return <div className='text-xs'>{value}</div>
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
              options?.onConnectProducts?.(product.id)
            }}
          >
            <Link2 className='mr-1 h-3.5 w-3.5' />
            Connect
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 border-red-200 px-2 text-xs text-red-500'
            onClick={(e) => {
              e.stopPropagation()
              console.log('Delete store product:', product.id)
              // TODO: 在这里调用删除店铺商品的接口
            }}
          >
            <Trash2 className='mr-1 h-3.5 w-3.5' />
          </Button>
        </div>
      )
    },
    enableSorting: false,
  },
]

// 为了向后兼容，导出一个默认的 columns
export const storeProductsColumns: ColumnDef<StoreProduct>[] =
  createStoreProductsColumns()
