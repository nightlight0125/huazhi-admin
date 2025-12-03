import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { type VariantPricing } from './variant-pricing-schema'

export const createVariantPricingColumns = (): ColumnDef<VariantPricing>[] => [
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
        className='h-3.5 w-3.5 translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='h-3.5 w-3.5 translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'images',
    header: 'Images',
    cell: () => (
      <div className='border-border bg-muted/30 h-10 w-10 overflow-hidden rounded-md border' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <div className='text-xs'>{row.getValue('sku')}</div>
    ),
  },
  {
    accessorKey: 'cjColor',
    header: 'CJ Color',
    cell: ({ row }) => (
      <div className='text-xs'>{row.getValue('cjColor')}</div>
    ),
  },
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ row }) => (
      <Input
        value={row.getValue('color')}
        className='h-6 w-20 text-center text-xs'
        readOnly
      />
    ),
  },
  {
    accessorKey: 'rrp',
    header: 'RRP',
    cell: ({ row }) => {
      const rrp = row.getValue('rrp') as number
      return (
        <div className='flex flex-col'>
          <span className='text-xs'>${rrp.toFixed(2)}</span>
          <span className='text-muted-foreground text-[10px]'>
            Estimated Profit 325%
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'cjPrice',
    header: 'CJ Price',
    cell: ({ row }) => {
      const price = row.getValue('cjPrice') as number
      return <div className='text-xs'>${price.toFixed(2)}</div>
    },
  },
  {
    accessorKey: 'shippingFee',
    header: 'Shipping Fee',
    cell: ({ row }) => (
      <div className='text-xs'>{row.getValue('shippingFee') || '--'}</div>
    ),
  },
  {
    accessorKey: 'totalDropshippingPrice',
    header: 'Total Dropshipping Price',
    cell: ({ row }) => (
      <div className='text-xs'>
        {row.getValue('totalDropshippingPrice') || '--'}
      </div>
    ),
  },
  {
    accessorKey: 'yourPrice',
    header: () => <span className='text-primary'>* Your Price</span>,
    cell: ({ row }) => (
      <Input
        value={row.getValue('yourPrice') || ''}
        className='h-6 w-16 text-xs'
        placeholder='Enter price'
      />
    ),
  },
]

