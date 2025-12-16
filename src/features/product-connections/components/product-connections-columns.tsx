import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { Link2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { shippingFromOptions, shippingMethodOptions } from '../data/data'
import { type ProductConnection } from '../data/schema'

export const productConnectionsColumns: ColumnDef<ProductConnection>[] = [
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
    accessorKey: 'productImage',
    header: '产品图片',
    cell: ({ row }) => {
      const image = row.getValue('productImage') as string
      return (
        <div className='h-16 w-16 overflow-hidden rounded-lg border'>
          <img
            src={image}
            alt='产品图片'
            className='h-full w-full object-cover'
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品名称' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('productName') as string
      const navigate = useNavigate()

      const handleProductClick = () => {
        // 这里可以根据实际的产品ID跳转，暂时使用行ID作为示例
        navigate({ to: `/products/${row.original.id}` })
      }

      return (
        <div className='max-w-64'>
          <Button
            variant='ghost'
            className='hover:bg-muted/50 h-auto justify-start p-0 text-left transition-colors'
            onClick={handleProductClick}
          >
            <span className='hover:text-primary line-clamp-3 leading-relaxed font-medium text-wrap break-words'>
              {name}
            </span>
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='价格' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return (
        <div className='text-right font-medium text-green-600'>
          ${price.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: 'shippingFrom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发货地' />
    ),
    cell: ({ row }) => {
      const shippingFrom = row.getValue('shippingFrom') as string
      const location = shippingFromOptions.find(
        (opt) => opt.value === shippingFrom
      )

      return (
        <div className='flex items-center gap-2'>
          <Badge variant='outline'>{location?.label || shippingFrom}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'shippingMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='装运方式' />
    ),
    cell: ({ row }) => {
      const shippingMethod = row.getValue('shippingMethod') as string
      const method = shippingMethodOptions.find(
        (opt: { value: string; label: string }) => opt.value === shippingMethod
      )

      return (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>{method?.label || shippingMethod}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'shippingCost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='运费' />
    ),
    cell: ({ row }) => {
      const shippingCost = row.getValue('shippingCost') as number
      return (
        <div className='text-right font-medium text-green-600'>
          ${shippingCost.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='总金额' />
    ),
    cell: ({ row }) => {
      const totalAmount = row.getValue('totalAmount') as number
      return (
        <div className='text-right text-lg font-bold text-green-600'>
          ${totalAmount.toFixed(2)}
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
              console.log('Connect products:', product.id)
              // TODO: 在这里调用关联产品的实际接口
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
              console.log('Delete product connection:', product.id)
              // TODO: 在这里调用删除关联关系的实际接口
            }}
          >
            <Trash2 className='mr-1 h-3.5 w-3.5' />
            Delete
          </Button>
        </div>
      )
    },
  },
]
