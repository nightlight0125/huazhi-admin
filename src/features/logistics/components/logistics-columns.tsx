import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Logistics } from '../data/schema'

export const createLogisticsColumns = (
  onEditShippingTo?: (row: Logistics) => void
): ColumnDef<Logistics>[] => {
  return [
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
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
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
      accessorKey: 'sku',
      size: 150,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='SPU' />
      ),
      cell: ({ row }) => {
        const logistics = row.original
        return (
          <div className='flex items-center gap-3'>
            <div className='bg-muted h-16 w-16 flex-shrink-0 overflow-hidden rounded border'>
              {logistics.productImage ? (
                <img
                  src={logistics.productImage}
                  alt='Product'
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                  <div className='flex flex-col items-center gap-1'>
                    <div className='h-8 w-6 rounded-t border-2 border-gray-300 bg-white'></div>
                    <div className='h-1 w-4 rounded bg-gray-400'></div>
                  </div>
                </div>
              )}
            </div>
            <div className='space-y-0.5 text-sm'>
              <div className='font-medium'>{logistics.sku}</div>
              <div className='text-muted-foreground'>
                Variant: {logistics.variant}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'qty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Qty' />
      ),
      cell: ({ row }) => <div>{row.getValue('qty')}</div>,
    },
    {
      accessorKey: 'shippingMethod',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Shipping Method' />
      ),
      cell: ({ row }) => <div>{row.getValue('shippingMethod')}</div>,
    },
    // {
    //   accessorKey: 'shippingFrom',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Shipping From' />
    //   ),
    //   cell: ({ row }) => <div>{row.getValue('shippingFrom')}</div>,
    // },
    {
      accessorKey: 'shippingTo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Shipping To' />
      ),
      cell: ({ row }) => <div>{row.getValue('shippingTo')}</div>,
    },
    {
      accessorKey: 'shippingTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Time' />
      ),
      cell: ({ row }) => <div>{row.getValue('shippingTime')}</div>,
    },
    {
      accessorKey: 'shippingPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Price' />
      ),
      cell: ({ row }) => {
        const price = row.getValue('shippingPrice') as number
        return <div>${price.toFixed(2)}</div>
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const logistics = row.original
        return (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={() => onEditShippingTo?.(logistics)}
            >
              <Pencil className='mr-1 h-3.5 w-3.5' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-7 border-red-200 px-2 text-xs text-red-500'
            >
              <Trash2 className='mr-1 h-3.5 w-3.5' />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      size: 150,
    },
  ]
}
