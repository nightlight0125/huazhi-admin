import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { shippingFromOptions, shippingMethodsByCountry } from '../data/data'
import { type ProductConnection } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

interface ColumnHandlers {
  onShippingFromClick: (productConnection: ProductConnection) => void
  onShippingMethodClick: (productConnection: ProductConnection) => void
  onBrandCustomizationClick: (productConnection: ProductConnection) => void
}

export const createProductConnectionsColumns = (handlers: ColumnHandlers): ColumnDef<ProductConnection>[] => [
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
        <div className='w-16 h-16 rounded-lg overflow-hidden border'>
          <img
            src={image}
            alt='产品图片'
            className='w-full h-full object-cover'
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
      
      const handleProductClick = () => {
        // 这里可以根据实际的产品ID跳转，暂时使用行ID作为示例
        window.location.href = `/products/${row.original.id}`
      }
      
      return (
        <div className='max-w-64'>
          <Button
            variant="ghost"
            className='h-auto p-0 text-left justify-start hover:bg-muted/50 transition-colors'
            onClick={handleProductClick}
          >
            <span className='font-medium leading-relaxed break-words text-wrap hover:text-primary whitespace-pre-line'>
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
        <div className='text-right font-medium'>
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
      const location = shippingFromOptions.find(opt => opt.value === shippingFrom)
      
      return (
        <div className='flex items-center gap-2'>
          <Badge variant='outline'>
            {location?.label || shippingFrom}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => handlers.onShippingFromClick(row.original)}
          >
            <Edit className="h-3 w-3" />
          </Button>
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
      const shippingMethodId = row.getValue('shippingMethod') as string
      
      // 在所有国家的运输方式中查找匹配的运输方式
      let method = null
      for (const countryMethods of Object.values(shippingMethodsByCountry)) {
        method = countryMethods.find(m => m.id === shippingMethodId)
        if (method) break
      }
      
      return (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>
            {method?.name || shippingMethodId}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => handlers.onShippingMethodClick(row.original)}
          >
            <Edit className="h-3 w-3" />
          </Button>
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
        <div className='text-right font-medium'>
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
        <div className='text-right font-bold text-lg'>
          ${totalAmount.toFixed(2)}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
