import { type ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { sourcingStatuses } from '../data/data'
import { type Sourcing } from '../data/schema'

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

  // Completed - 浅绿色背景，白色文字
  if (lower === 'completed') {
    return 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white'
  }
  // Processing - 浅紫色背景，白色文字
  if (lower === 'processing') {
    return 'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-white'
  }
  // Failed - 浅红色背景，白色文字
  if (lower === 'failed') {
    return 'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white'
  }

  // 默认灰色
  return 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

export const createSourcingColumns = (
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
      const name = sourcing.productName || ''
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
            {name ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    className='text-foreground line-clamp-2 max-w-[220px] text-left text-[10px] leading-tight'
                  >
                    {name}
                  </button>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs text-xs'>
                  {name}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
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
    enableHiding: false,
  },
  {
    accessorKey: 'result',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Result' />
    ),
    cell: ({ row }) => {
      const sourcing = row.original
      const productId = sourcing.productId
      const image = sourcing.images?.[0] || '/placeholder-image.png'
      const productName = sourcing.productName || '-'
      const result = sourcing.result || '-'

      const spuMatch =
        result.match(/SU\d+/i) || result.match(/TD\s+SPU:\s*(.+)/i)
      const spu = spuMatch ? spuMatch[1] || spuMatch[0] : result

      const priceRange = (sourcing as any).priceRange || '-'

      return (
        <div
          className={`flex items-center gap-2 ${productId ? 'cursor-pointer' : ''}`}
          onClick={() => {
            window.open(sourcing.url, '_blank')
          }}
        >
          <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border'>
            <img
              src={image}
              alt={productName}
              className='h-full w-full object-cover'
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-image.png'
              }}
            />
          </div>

          <div className='min-w-0 flex-1'>
            <div className='truncate text-[10px] leading-tight font-medium text-gray-900'>
              toy
            </div>
            <div className='mt-0.5 text-[10px] leading-tight text-gray-500'>
              TD SPU: {spu}
            </div>
            <div className='mt-0.5 text-[10px] leading-tight text-gray-500'>
              Price: {priceRange}
            </div>
          </div>

          {/* 眼睛图标 */}
          {productId && (
            <div className='flex-shrink-0'>
              <Eye className='h-3 w-3 text-gray-400' />
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remark' />
    ),
    cell: ({ row }) => {
      const remark = (row.getValue('remark') as string | undefined) || ''
      const sourcing = row.original

      if (!remark) {
        return <div className='text-muted-foreground text-xs'>-</div>
      }

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              className='text-muted-foreground max-w-[140px] truncate text-left text-xs'
              onClick={(e) => {
                e.stopPropagation()
                handlers?.onRemarkClick?.(sourcing)
              }}
            >
              {remark}
            </button>
          </TooltipTrigger>
          <TooltipContent className='max-w-xs text-xs'>{remark}</TooltipContent>
        </Tooltip>
      )
    },
    enableSorting: false,
    enableHiding: false,
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
    enableHiding: false,
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
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const sourcing = row.original
      return (
        <Button
          variant='outline'
          size='sm'
          className='h-7 px-2 text-xs'
          onClick={(e) => {
            e.stopPropagation()
            handlers?.onEdit?.(sourcing)
          }}
        >
          Contact
        </Button>
      )
    },
    enableHiding: false,
  },
]

// 为了向后兼容，导出一个默认的 columns
export const sourcingColumns: ColumnDef<Sourcing>[] = createSourcingColumns()
