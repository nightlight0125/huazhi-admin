import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
  onDelete?: (sourcing: Sourcing) => void
}

function getSourcingStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === '0') return 'default'
  if (status === '1') return 'secondary'
  return 'secondary'
}

function getSourcingStatusClassName(status: string): string {
  if (status === '0') {
    return 'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white'
  }
  if (status === '1') {
    return 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

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
      const rawStatus = String(
        (sourcing as any).hzkj_accept_status ?? sourcing.status ?? ''
      ).trim()
      const rawStatusTitle = String(
        (sourcing as any).hzkj_accept_status_title ?? ''
      ).trim()
      // 仅“已采纳”时展示结果：当前接口中 1=accepted，兼容中文标题
      const isAccepted =
        rawStatus === '1' || rawStatusTitle === '已采纳' || rawStatus === 'accepted'

      const entryList = Array.isArray(sourcing.entryentity)
        ? (sourcing.entryentity as Array<Record<string, unknown>>)
        : []
      const acceptedEntry = isAccepted
        ? entryList.find((entry) => String((entry as any).hzkj_accept ?? '') === '1')
        : undefined

      if (!acceptedEntry) {
        return <div className='text-xs text-muted-foreground'>-</div>
      }

      const productId =
        typeof acceptedEntry.hzkj_spu_id === 'string'
          ? acceptedEntry.hzkj_spu_id
          : sourcing.productId
      const image =
        (acceptedEntry.hzkj_spu_hzkj_picturefield as string) || ''
      const productName =
        (acceptedEntry.hzkj_spu_hzkj_enname as string)  || '-'
      const spu =
        (acceptedEntry.hzkj_spu_number as string) ||
        '-'
      const rawPrice = (acceptedEntry as any).hzkj_spu_hzkj_pur_price
      const price =
        rawPrice !== undefined && rawPrice !== null && rawPrice !== ''
          ? Number(rawPrice)
          : undefined

      return (
        <div
          className={`flex items-center gap-2 ${productId ? 'cursor-pointer' : ''}`}
          onClick={() => {
            window.open(sourcing.url, '_blank')
          }}
        >
          <div className='border-border relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border'>
            <img
              src={image}
              className='h-full w-full object-cover'
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-image.png'
              }}
            />
          </div>

          <div className='min-w-0 flex-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='text-foreground max-w-[220px] truncate text-[10px] leading-tight font-medium'>
                  {productName}
                </div>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs break-words text-xs'>
                {productName}
              </TooltipContent>
            </Tooltip>
            <div className='text-muted-foreground mt-0.5 text-[10px] leading-tight'>
              SPU: {spu}
            </div>
            <div className='text-muted-foreground mt-0.5 text-[10px] leading-tight'>
              Price: {typeof price === 'number' && !Number.isNaN(price) ? `$${price.toFixed(2)}` : '-'}
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reason' />
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
      const sourcing = row.original
      const entryEntity =
        Array.isArray(sourcing.entryentity) && sourcing.entryentity.length > 0
          ? sourcing.entryentity[0]
          : null

      const hzkjDate = entryEntity?.hzkj_date

      if (!hzkjDate) {
        return <div className='text-xs'>-</div>
      }

      return <div className='text-xs'>{String(hzkjDate)}</div>
    },
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const sourcing = row.original
      return (
        <>
          <div className='flex items-center gap-2'>
            <Edit
              className='h-3.5 w-3.5 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                handlers?.onEdit?.(sourcing)
              }}
            />
            <Trash2
              className='h-3.5 w-3.5 cursor-pointer text-gray-500'
              onClick={(e) => {
                e.stopPropagation()
                handlers?.onDelete?.(sourcing)
              }}
            />
          </div>
        </>
      )
    },
    enableHiding: false,
  },
]

export const sourcingColumns: ColumnDef<Sourcing>[] = createSourcingColumns()
