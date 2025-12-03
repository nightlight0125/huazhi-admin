import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { type InventoryItem } from '../data/schema'

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
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
    accessorKey: 'QTY',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inventory QTY' />
    ),
    cell: ({ row }) => <div>{row.getValue('inventoryQty')}</div>,
  },
  {
    accessorKey: 'Available Inventory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inventory QTY' />
    ),
    cell: ({ row }) => <div>{row.getValue('inventoryQty')}</div>,
  },
  {
    accessorKey: 'Under Procurement',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inventory QTY' />
    ),
    cell: ({ row }) => <div>{row.getValue('inventoryQty')}</div>,
  },
]
