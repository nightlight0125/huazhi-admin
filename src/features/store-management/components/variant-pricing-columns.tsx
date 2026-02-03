import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { type ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { type VariantPricing } from './variant-pricing-schema'

// Editable cell component
type EditableCellProps = {
  value: string
  onValueChange: (value: string) => void
  className?: string
  placeholder?: string
}

function EditableCell({
  value,
  onValueChange,
  className,
  placeholder,
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  return (
    <Input
      value={localValue}
      onChange={(e) => {
        const newValue = e.target.value
        setLocalValue(newValue)
        onValueChange(newValue)
      }}
      className={className}
      placeholder={placeholder}
    />
  )
}

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
      <EditableCell
        value={row.getValue('sku') as string}
        onValueChange={(newValue) => {
          ;(row.original as VariantPricing).sku = newValue
        }}
        className='h-6 w-20 text-center text-xs'
      />
    ),
  },
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue('color') as string}
        onValueChange={(newValue) => {
          ;(row.original as VariantPricing).color = newValue
        }}
        className='h-6 w-20 text-center text-xs'
      />
    ),
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => (
      <EditableCell
        value={(row.getValue('size') as string) || ''}
        onValueChange={(newValue) => {
          ;(row.original as VariantPricing & { size?: string }).size = newValue
        }}
        className='h-6 w-20 text-center text-xs'
      />
    ),
  },
  {
    accessorKey: 'cjPrice',
    header: 'TD Price',
    cell: ({ row }) => {
      const price = row.getValue('cjPrice') as number | undefined
      return (
        <div className='text-xs'>
          {price != null ? `$${price.toFixed(2)}` : '--'}
        </div>
      )
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
    header: 'Total TD Price',
    cell: ({ row }) => (
      <div className='text-xs'>
        {row.getValue('totalDropshippingPrice') || '--'}
      </div>
    ),
  },
  {
    accessorKey: 'yourPrice',
    header: () => <span className='text-primary'>* Your Price</span>,
    cell: ({ row }) => {
      // 直接读取 row.original 以确保获取最新值
      const variant = row.original as VariantPricing
      return (
        <EditableCell
          key={`yourPrice-${variant.id}-${variant.yourPrice || ''}`}
          value={variant.yourPrice || ''}
          onValueChange={(newValue) => {
            variant.yourPrice = newValue
          }}
          className='h-6 w-16 text-xs'
          placeholder='Enter price'
        />
      )
    },
  },
]

