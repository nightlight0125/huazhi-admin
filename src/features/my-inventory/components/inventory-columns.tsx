import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type InventoryItem } from '../data/schema'

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'spu',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SPU' />
    ),
    cell: ({ row }) => <div className='font-medium'>{row.getValue('spu')}</div>,
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SKU' />
    ),
    cell: ({ row }) => <div>{row.getValue('sku')}</div>,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      return <div>${price.toFixed(2)}</div>
    },
  },
  {
    accessorKey: 'inventoryQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inventory QTY' />
    ),
    cell: ({ row }) => <div>{row.getValue('inventoryQty')}</div>,
  },
]

