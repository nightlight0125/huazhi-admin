import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { statuses, qualities } from '../data/data'
import { type Quote } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const quotesColumns: ColumnDef<Quote>[] = [
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
    accessorKey: 'images',
    header: '图片',
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      const firstImage = images[0]
      
      return (
        <div className='flex items-center space-x-2'>
          <div className='relative size-12 overflow-hidden rounded-md border'>
            <img
              src={firstImage}
              alt='产品图片'
              className='size-full object-cover'
            />
          </div>
          {images.length > 1 && (
            <div className='text-xs text-muted-foreground'>
              +{images.length - 1}
            </div>
          )}
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
      const productName = row.getValue('productName') as string
      const productUrl = row.original.productUrl
      
      return (
        <div className='max-w-48'>
          {productUrl ? (
            <a
              href={productUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-primary hover:underline'
            >
              {productName}
            </a>
          ) : (
            <span className='font-medium'>{productName}</span>
          )}
        </div>
      )
    },
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
          {sku || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-20 items-center gap-2'>
          {status.icon && (
            <status.icon />
          )}
          <span className='text-sm'>{status.label}</span>
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
      const price = row.getValue('price') as number | undefined
      return (
        <div className='w-20 text-right font-mono'>
          {price ? `¥${price.toFixed(2)}` : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'quality',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='质量等级' />
    ),
    cell: ({ row }) => {
      const quality = qualities.find(
        (q) => q.value === row.getValue('quality')
      )

      if (!quality) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          {quality.icon && (
            <quality.icon />
          )}
          <span className='text-sm'>{quality.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
