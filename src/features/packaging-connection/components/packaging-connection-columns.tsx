import { type ColumnDef } from '@tanstack/react-table'
import {
  ChevronRight,
  Image as ImageIcon,
  Link2,
  Link2Off,
  Minus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type StoreSku } from '../data/schema'

export const createPackagingConnectionColumns = (options?: {
  onExpand?: (rowId: string) => void
  expandedRows?: Set<string>
  onDisconnect?: (storeSku: StoreSku) => void
  onConnect?: (storeSku: StoreSku) => void
  isConnectedFilter?: boolean
}): ColumnDef<StoreSku>[] => {
  const {
    onExpand,
    expandedRows = new Set(),
    onDisconnect,
    onConnect,
    isConnectedFilter = false,
  } = options || {}

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
      size: 40,
    },
    {
      id: 'expand',
      header: '',
      cell: ({ row }) => {
        const hasPackagingProducts =
          row.original.packagingProducts &&
          row.original.packagingProducts.length > 0
        const isExpanded = expandedRows.has(row.id)

        if (!hasPackagingProducts) {
          return <div className='w-6' />
        }

        return (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => onExpand?.(row.id)}
          >
            {isExpanded ? (
              <Minus className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'storeSku',
      header: 'Store SKU',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className='flex items-center gap-3'>
            <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
              <img
                src={item.image}
                alt={item.name}
                className='h-full w-full object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.png'
                }}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <div className='text-sm font-medium'>{item.name}</div>
              <div className='text-muted-foreground text-xs'>
                SKU: {item.sku}
              </div>
              <div className='text-muted-foreground text-xs'>
                Variant ID: {item.variantId}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: isConnectedFilter ? 'tdSku' : 'hzProduct',
      id: isConnectedFilter ? 'tdSku' : 'hzProduct',
      header: isConnectedFilter ? 'TD SKU' : 'HZ Product',
      cell: ({ row }) => {
        const item = row.original
        if (isConnectedFilter) {
          // For Connected filter, show TD SKU
          if (item.hzProductImage && item.hzProductSku) {
            return (
              <div className='flex items-center gap-3'>
                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
                  <img
                    src={item.hzProductImage}
                    alt='TD SKU'
                    className='h-full w-full object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='text-sm font-medium'>TD SKU</div>
                  <div className='text-muted-foreground text-xs'>
                    SKU: {item.hzProductSku}
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div className='flex items-center gap-3'>
              <div className='bg-muted relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border'>
                <ImageIcon className='text-muted-foreground h-6 w-6' />
              </div>
              <div className='flex flex-col gap-1'>
                <div className='text-muted-foreground text-sm'>SKU: ---</div>
              </div>
            </div>
          )
        } else {
          // For Unconnected/All, show HZ Product
          if (item.isConnected && item.hzProductImage && item.hzProductSku) {
            return (
              <div className='flex items-center gap-3'>
                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
                  <img
                    src={item.hzProductImage}
                    alt='HZ Product'
                    className='h-full w-full object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='text-sm font-medium'>HZ Product</div>
                  <div className='text-muted-foreground text-xs'>
                    SKU: {item.hzProductSku}
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div className='flex items-center gap-3'>
              <div className='bg-muted relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border'>
                <ImageIcon className='text-muted-foreground h-6 w-6' />
              </div>
              <div className='flex flex-col gap-1'>
                <div className='text-muted-foreground text-sm'>---</div>
              </div>
            </div>
          )
        }
      },
      size: 250,
    },
    {
      accessorKey: 'storeName',
      header: 'Store Name',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className='flex items-center gap-2'>
            <span className='text-green-600'>$</span>
            <span className='text-sm'>{item.storeName}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return true
        }
        const storeName = row.getValue(id) as string
        return value.includes(storeName)
      },
      size: 150,
    },
    {
      accessorKey: 'isConnected',
      id: 'status',
      header: 'Status',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <Badge
            variant='outline'
            className={
              item.isConnected
                ? 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }
          >
            {item.isConnected ? 'Connected' : 'Unconnected'}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return true
        }
        const isConnected = row.getValue(id) as boolean
        return value.some((val: string) => {
          if (val === 'connected') {
            return isConnected === true
          }
          if (val === 'unconnected') {
            return isConnected === false
          }
          return false
        })
      },
      size: 120,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className='text-sm font-medium'>${item.price.toFixed(2)}</div>
        )
      },
      size: 100,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const item = row.original

        return (
          <div className='flex gap-2'>
            {item.isConnected ? (
              <Button
                variant='outline'
                size='sm'
                className='h-7 border-red-200 px-2 text-xs text-red-500'
                onClick={(e) => {
                  e.stopPropagation()
                  onDisconnect?.(item)
                }}
              >
                <Link2Off className='mr-1 h-3.5 w-3.5' />
                Disconnect
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                className='h-7 border-orange-200 bg-orange-50 px-2 text-xs text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30'
                onClick={(e) => {
                  e.stopPropagation()
                  onConnect?.(item)
                }}
              >
                <Link2 className='mr-1 h-3.5 w-3.5' />
                Connect
              </Button>
            )}
          </div>
        )
      },
      enableSorting: false,
      size: 140,
    },
  ]
}
