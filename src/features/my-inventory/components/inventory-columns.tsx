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
      <DataTableColumnHeader column={column} title='HZ SKU' />
    ),
    cell: ({ row }) => <div>{row.getValue('sku')}</div>,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue<number>('price') ?? 0
      return (
        <div className='font-medium text-green-600'>
          ${price.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: 'warehouse',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Warehouse' />
    ),
    cell: ({ row }) => <div>{row.getValue('warehouse')}</div>,
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='QTY' />
    ),
    cell: ({ row }) => <div>{row.getValue('qty')}</div>,
  },
  {
    accessorKey: 'availableInventory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Available Inventory' />
    ),
    cell: ({ row }) => <div>{row.getValue('availableInventory')}</div>,
  },
  {
    accessorKey: 'underProcurement',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Under Procurement' />
    ),
    cell: ({ row }) => <div>{row.getValue('underProcurement')}</div>,
  },
]
