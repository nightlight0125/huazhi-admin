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

// 规格类型定义
type SpecInfo = {
  specId: string
  specName: string
  specNumber: string
}

export const createVariantPricingColumns = (
  specs?: SpecInfo[]
): ColumnDef<VariantPricing>[] => {
  const baseColumns: ColumnDef<VariantPricing>[] = [
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
      cell: ({ row }) => {
        const variant = row.original as VariantPricing
        const imageUrl = variant.image
        return (
          <div className='border-border bg-muted/30 h-10 w-10 overflow-hidden rounded-md border'>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={variant.sku || 'Product'}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-[8px]'>
                No Image
              </div>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => {
        const variant = row.original as VariantPricing
        return (
          <div className='text-xs text-muted-foreground'>
            {variant.sku || '--'}
          </div>
        )
      },
    },
  ]

  // 根据规格动态添加列
  const specColumns: ColumnDef<VariantPricing>[] = []
  if (specs && specs.length > 0) {
    specs.forEach((spec) => {
      specColumns.push({
        accessorKey: `spec_${spec.specId}`,
        header: spec.specName,
        cell: ({ row }) => {
          const variant = row.original as VariantPricing
          const specValue = (variant as any)[`spec_${spec.specId}`] || ''
          return <div className='text-xs'>{specValue || '--'}</div>
        },
      })
    })
  }

  // 固定列：TD Price, Shipping Fee, Total TD Price, Your Price
  const fixedColumns: ColumnDef<VariantPricing>[] = [
    {
      accessorKey: 'cjPrice',
      header: 'TD Price',
      cell: ({ row }) => {
        const variant = row.original as VariantPricing
        const price = variant.cjPrice
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
      cell: ({ row }) => {
        const variant = row.original as VariantPricing
        return (
          <div className='text-xs'>{variant.shippingFee || '--'}</div>
        )
      },
    },
    {
      accessorKey: 'totalDropshippingPrice',
      header: 'Total TD Price',
      cell: ({ row }) => {
        const variant = row.original as VariantPricing
        return (
          <div className='text-xs'>
            {variant.totalDropshippingPrice || '--'}
          </div>
        )
      },
    },
    {
      accessorKey: 'yourPrice',
      header: () => <span className='text-primary'>* Your Price</span>,
      cell: ({ row }) => {
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

  return [...baseColumns, ...specColumns, ...fixedColumns]
}

