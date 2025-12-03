import { type NavigateOptions } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { sourcingStatuses } from '../data/data'
import { type Sourcing } from '../data/schema'

type NavigateFn = (options: NavigateOptions) => void

type SourcingColumnHandlers = {
  onEdit?: (sourcing: Sourcing) => void
  onRemarkClick?: (sourcing: Sourcing) => void
}

// 状态到颜色/样式的映射（与其他列表保持一致）
function getSourcingStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const lower = status.toLowerCase()

  if (lower === 'completed') return 'default'
  if (lower === 'processing') return 'secondary'
  if (lower === 'failed') return 'destructive'
  return 'secondary'
}

function getSourcingStatusClassName(status: string): string {
  const lower = status.toLowerCase()

  if (lower === 'completed') {
    return 'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400'
  }
  if (lower === 'processing') {
    return 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400'
  }
  if (lower === 'failed') {
    return 'bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400'
  }

  return ''
}

export const createSourcingColumns = (
  navigate: NavigateFn,
  handlers?: SourcingColumnHandlers
): ColumnDef<Sourcing>[] => [
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
    accessorKey: 'sourcingId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sourcing ID' />
    ),
    cell: ({ row }) => (
      <div className='text-xs font-medium'>{row.getValue('sourcingId')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL/Images' />
    ),
    cell: ({ row }) => {
      const sourcing = row.original
      return (
        <div
          className='flex cursor-pointer items-start gap-2'
          onClick={() => handlers?.onEdit?.(sourcing)}
        >
          {sourcing.images && sourcing.images.length > 0 && (
            <div className='flex gap-1'>
              {sourcing.images.slice(0, 2).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className='h-10 w-10 rounded object-cover'
                />
              ))}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <div className='flex items-start gap-1'>
              <p className='line-clamp-3 text-[10px] leading-tight'>
                {sourcing.productName}
              </p>
              <Eye className='mt-0.5 h-3 w-3 shrink-0 text-gray-400' />
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = sourcingStatuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <Badge
          variant={getSourcingStatusVariant(status.value)}
          className={
            getSourcingStatusClassName(status.value) || 'text-xs font-normal'
          }
        >
          {status.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'result',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Result' />
    ),
    cell: ({ row }) => {
      const result = row.getValue('result') as string | undefined
      const sourcing = row.original
      // 使用 productId 字段，如果不存在则不显示为可点击
      const productId = sourcing.productId

      if (!productId) {
        return <div className='text-xs'>{result || '-'}</div>
      }

      return (
        <div
          className='hover:text-primary cursor-pointer text-xs hover:underline'
          onClick={(e) => {
            e.stopPropagation()
            navigate({
              to: '/products/$productId',
              params: { productId },
            })
          }}
        >
          {result || '-'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remark' />
    ),
    cell: ({ row }) => {
      const remark = row.getValue('remark') as string | undefined
      const sourcing = row.original
      const productId = sourcing.productId

      if (!productId) {
        return <div className='text-xs'>{remark || ''}</div>
      }

      return (
        <button
          type='button'
          className='hover:text-primary cursor-pointer text-left text-xs hover:underline'
          onClick={(e) => {
            e.stopPropagation()
            handlers?.onRemarkClick?.(sourcing)
          }}
        >
          {remark || ''}
        </button>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdTime') as Date
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      const year = date.getFullYear()
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      return (
        <div className='text-xs'>
          {month}. {day}, {year} {time}
        </div>
      )
    },
  },
  {
    accessorKey: 'resultTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Result Time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('resultTime') as Date | undefined
      if (!date) return <div className='text-xs'>-</div>
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      const year = date.getFullYear()
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      return (
        <div className='text-xs'>
          {month}. {day}, {year} {time}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className='text-xs font-medium'>Operation</div>,
    cell: ({ row }) => {
      return (
        <>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => {
              // Handle connect HZ product action
              console.log('Connect HZ Product:', row.original.sourcingId)
            }}
          >
            Connect HZ Product
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => {
              console.log('Delete:', row.original.sourcingId)
            }}
          >
            Delete
          </Button>
        </>
      )
    },
  },
]

// 为了向后兼容，导出一个默认的 columns（不包含导航功能）
export const sourcingColumns: ColumnDef<Sourcing>[] = createSourcingColumns(
  () => {
    console.warn('Navigate function not provided to sourcing columns')
  }
)
