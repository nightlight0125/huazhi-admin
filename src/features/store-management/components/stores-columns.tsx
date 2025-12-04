import { type ColumnDef } from '@tanstack/react-table'
import { Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Store } from '../data/schema'

// 状态到颜色的映射函数
function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const lowerStatus = status.toLowerCase()

  // Store Status 映射
  if (
    lowerStatus.includes('active') ||
    lowerStatus.includes('authorized') ||
    lowerStatus.includes('connected')
  ) {
    return 'default' // 绿色/主色
  }
  if (
    lowerStatus.includes('inactive') ||
    lowerStatus.includes('disconnected')
  ) {
    return 'secondary' // 灰色
  }
  if (
    lowerStatus.includes('suspended') ||
    lowerStatus.includes('unauthorized') ||
    lowerStatus.includes('failed')
  ) {
    return 'destructive' // 红色
  }
  if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
    return 'outline' // 边框样式，可以自定义颜色
  }

  return 'secondary' // 默认灰色
}

// 获取状态的自定义样式类
function getStatusClassName(status: string): string {
  const lowerStatus = status.toLowerCase()

  // Active/Authorized/Connected - 绿色背景，白色文字
  if (
    lowerStatus.includes('active') ||
    lowerStatus.includes('authorized') ||
    lowerStatus.includes('connected')
  ) {
    return 'border-transparent bg-green-600 text-white dark:bg-green-600 dark:text-white'
  }

  // Pending/Processing - 橙色背景，白色文字
  if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
    return 'border-transparent bg-orange-500 text-white dark:bg-orange-500 dark:text-white'
  }

  // Suspended/Unauthorized/Failed - 红色背景，白色文字
  if (
    lowerStatus.includes('suspended') ||
    lowerStatus.includes('unauthorized') ||
    lowerStatus.includes('failed') ||
    lowerStatus.includes('refused')
  ) {
    return 'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white'
  }

  // Normal/Inactive/Finished - 浅灰色背景，深灰色文字
  if (
    lowerStatus.includes('normal') ||
    lowerStatus.includes('inactive') ||
    lowerStatus.includes('finished') ||
    lowerStatus.includes('disconnected')
  ) {
    return 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  // 默认灰色
  return 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

type StoresColumnsOptions = {
  onEditStoreName?: (store: Store) => void
}

export const createStoresColumns = (
  options?: StoresColumnsOptions
): ColumnDef<Store>[] => [
  {
    id: 'select',
    size: 40,
    minSize: 40,
    maxSize: 40,
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
    accessorKey: 'storeName',
    size: 220,
    minSize: 100,
    maxSize: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Name' />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className='flex max-w-[260px] flex-col text-left break-words whitespace-normal'>
          <span className='leading-snug font-medium'>
            {row.getValue('storeName')}
          </span>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              options?.onEditStoreName?.(store)
            }}
            className='text-muted-foreground hover:text-foreground mt-1 flex h-3 w-3 cursor-pointer items-center transition-colors'
            aria-label='Edit store name'
          >
            <Edit className='h-3 w-3' />
          </button>
        </div>
      )
    },
  },
  {
    accessorKey: 'storeId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store ID' />
    ),
    cell: ({ row }) => <div className='text-sm'>{row.getValue('storeId')}</div>,
  },
  {
    accessorKey: 'authorizationTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Authorization Time' />
    ),
    cell: ({ row }) => {
      const authTime = row.getValue('authorizationTime') as {
        date: string
        time: string
      }
      return (
        <div className='flex flex-col text-sm'>
          <span>{authTime.date}</span>
          <span className='text-muted-foreground'>{authTime.time}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Create Time' />
    ),
    cell: ({ row }) => {
      const createTime = row.getValue('createTime') as {
        date: string
        time: string
      }
      return (
        <div className='flex flex-col text-sm'>
          <span>{createTime.date}</span>
          <span className='text-muted-foreground'>{createTime.time}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'storeStatus',
    size: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('storeStatus') as string
      const variant = getStatusVariant(status)
      const customClassName = getStatusClassName(status)

      return (
        <Badge variant={variant} className={customClassName || undefined}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'authorizationStatus',
    size: 160,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Authorization Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('authorizationStatus') as string
      const variant = getStatusVariant(status)
      const customClassName = getStatusClassName(status)

      return (
        <Badge variant={variant} className={customClassName || undefined}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'platformType',
    size: 140,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Platform Type' />
    ),
    cell: ({ row }) => <div>{row.getValue('platformType')}</div>,
  },
]
