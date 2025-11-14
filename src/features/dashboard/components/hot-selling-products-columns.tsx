import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type HotSellingProduct } from '../data/schema'

export const createHotSellingProductsColumns =
  (): ColumnDef<HotSellingProduct>[] => [
    {
      accessorKey: 'ranking',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ranking' />
      ),
      cell: ({ row }) => (
        <div className='text-sm font-medium'>{row.getValue('ranking')}</div>
      ),
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Product Name' />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>{row.getValue('productName')}</div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Quantity' />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>{row.getValue('quantity')}</div>
      ),
    },
    {
      accessorKey: 'sellingAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Selling Amount' />
      ),
      cell: ({ row }) => {
        const amount = row.getValue('sellingAmount') as number
        return <div className='text-sm font-medium'>${amount.toFixed(2)}</div>
      },
    },
  ]
