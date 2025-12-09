import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type LikedProduct } from '../data/schema'
import { LikedProductsRowActions } from './liked-products-row-actions'

export const createLikedProductsColumns = (): ColumnDef<LikedProduct>[] => {
  const columns: ColumnDef<LikedProduct>[] = [
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
          <div className='text-xs'>
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
  ]

  // 添加 actions 列
  columns.push({
    id: 'actions',
    cell: ({ row }) => <LikedProductsRowActions row={row} />,
  })

  return columns
}

// 向后兼容：默认导出
export const likedProductsColumns = createLikedProductsColumns()
