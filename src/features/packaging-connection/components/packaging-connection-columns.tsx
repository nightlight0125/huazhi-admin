import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import {
  ChevronRight,
  Link2,
  Link2Off,
  Minus,
  Trash2,
} from 'lucide-react'
import { type StoreSku } from '../data/schema'

export const createPackagingConnectionColumns = (options?: {
  onExpand?: (rowId: string) => void
  expandedRows?: Set<string>
  onDisconnect?: (storeSku: StoreSku) => void
  onConnect?: (storeSku: StoreSku) => void
  onDelete?: (item: any) => void
  isStoreTab?: boolean
}): ColumnDef<StoreSku | any>[] => {
  const {
    onExpand,
    expandedRows = new Set(),
    onDisconnect,
    onConnect,
    onDelete,
    isStoreTab = false,
  } = options || {}

  // 如果是 stores tab，返回不同的列定义
  if (isStoreTab) {
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
        accessorKey: 'hzkj_pk_shop_name',
        id: 'store',
        header: 'Store',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='text-sm'>{item.hzkj_pk_shop_name || '---'}</div>
          )
        },
        size: 150,
      },
      {
        accessorKey: 'hzkj_shop_package_hzkj_name',
        id: 'packagingProducts',
        header: 'Packaging Products',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex items-center gap-3'>
              <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
                <img
                  src={item.hzkj_shop_package_hzkj_picturefield || ''}
                  alt={item.hzkj_shop_package_hzkj_name || ''}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-image.png'
                  }}
                />
              </div>
              <div className='flex flex-col gap-1'>
                <div className='text-sm font-medium'>
                  {item.hzkj_shop_package_hzkj_name || '---'}
                </div>
                <div className='text-muted-foreground text-xs'>
                  SKU: {item.hzkj_shop_package_number || '---'}
                </div>
                {item.hzkj_shop_package_hzkj_sku_value && (
                  <div className='text-muted-foreground text-xs'>
                    {item.hzkj_shop_package_hzkj_sku_value}
                  </div>
                )}
              </div>
            </div>
          )
        },
        size: 300,
      },
      {
        accessorKey: 'hzkj_shop_pk_qty',
        id: 'qty',
        header: 'Qty',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='text-sm'>{item.hzkj_shop_pk_qty ?? item.hzkj_pk_qty ?? '---'}</div>
          )
        },
        size: 100,
      },
      {
        accessorKey: 'hzkj_modifydate',
        id: 'operationTime',
        header: 'Operation Time',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='text-sm'>{item.hzkj_modifydate || '---'}</div>
          )
        },
        size: 180,
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='h-7 border-red-200 px-2 text-xs text-red-500 hover:bg-red-50'
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(item)
                }}
              >
                <Trash2 className='mr-1 h-3.5 w-3.5' />
                Delete
              </Button>
            </div>
          )
        },
        enableSorting: false,
        size: 120,
      },
    ]
  }

  // 原有的列定义（用于 products 和 order tab）
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
                src={item.hzkj_variant_picture || item.image || ''}
               
                className='h-full w-full object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.png'
                }}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <div className='text-sm font-medium'>{item.hzkj_local_sku_hzkj_name || item.hzkj_shop_package_hzkj_name}</div>
              <div className='text-muted-foreground text-xs'>
                SKU: {item.hzkj_shop_sku || item.hzkj_shop_package_number}
              </div>
              <div className='text-muted-foreground text-xs'>
                Variant ID: {item.hzkj_variantid || '---'}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: 'Product' ,
      header: 'Product',
      cell: ({ row }) => {
        const item = row.original
            return (
              <div className='flex items-center gap-3'>
                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
                  <img
                    src={item.hzkj_local_sku_hzkj_picturefield ||  ''}
                    alt='SKU'
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='text-sm font-medium'>{item.hzkj_local_sku_hzkj_name || '---'}</div>
                  <div className='text-muted-foreground text-xs'>
                    SKU: {item.hzkj_local_sku_number ||  '---'}
                  </div>
                </div>
              </div>
            )
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
            <span className='text-sm'>{item.hzkj_od_pd_shop_name || item.hzkj_pk_shop_name || item.storeName}</span>
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
      enableColumnFilter: false, // 禁用客户端过滤，因为使用服务端过滤
      cell: ({ row }) => {
        const item = row.original
        return (
          <Badge
            variant='outline'
            className={
              item.hzkj_isconnect
                ? 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }
          >
            {item.hzkj_isconnect ? 'Connected' : 'Unconnected'}
          </Badge>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const item = row.original
        const price = item.hzkj_variant_price ?? item.price
        const formattedPrice =
          price != null && typeof price === 'number' && !isNaN(price)
            ? price.toFixed(2)
            : '0.00'
        return (
          <div className='text-sm font-medium'>${formattedPrice}</div>
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
            {item.hzkj_isconnect ? (
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
