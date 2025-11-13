import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { categories, locations } from '../data/data'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const productsColumns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='选择全部'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'image',
    header: '头图',
    cell: ({ row }) => {
      const image = row.getValue('image') as string
      
      return (
        <div className='flex items-center space-x-2'>
          <div className='relative size-12 overflow-hidden rounded-md border'>
            <img
              src={image}
              alt='产品头图'
              className='size-full object-cover'
            />
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品名称' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      
      return (
        <div className='max-w-48'>
          <span className='font-medium'>{name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'shippingLocation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发货地' />
    ),
    cell: ({ row }) => {
      const location = locations.find(
        (loc) => loc.value === row.getValue('shippingLocation')
      )

      if (!location) {
        return null
      }

      return (
        <div className='flex w-20 items-center gap-2'>
          {location.icon && (
            <location.icon />
          )}
          <span className='text-sm'>{location.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
        <div className='w-24 text-right font-mono font-medium'>
          ${price.toFixed(2)}
        </div>
      )
    },
    // filterFn: 'priceRange', // 需要自定义过滤器函数
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SKU' />
    ),
    cell: ({ row }) => {
      const sku = row.getValue('sku') as string
      return (
        <div className='w-24 font-mono text-sm'>
          {sku}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类别' />
    ),
    cell: ({ row }) => {
      const category = categories.find(
        (cat) => cat.value === row.getValue('category')
      )

      if (!category) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          {category.icon && (
            <category.icon />
          )}
          <span className='text-sm'>{category.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'supplier',
    accessorFn: () => 'supplier-a', // 默认值，实际应该从产品数据中获取
    header: '供应商',
    enableHiding: true,
    enableSorting: false,
    filterFn: (row, id, value) => {
      // 这里可以根据实际的产品供应商数据进行筛选
      // 目前返回 true 表示所有产品都匹配（因为产品数据中没有 supplier 字段）
      if (!value || value.length === 0) return true
      // 可以根据实际需求实现筛选逻辑
      return true
    },
  },
  {
    accessorKey: 'sales',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='销量' />
    ),
    cell: ({ row }) => {
      const sales = row.getValue('sales') as number
      return (
        <div className='w-20 text-right font-mono'>
          {sales.toLocaleString()}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建日期' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='w-24 text-sm'>
          {format(date, 'MM/dd', { locale: zhCN })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
