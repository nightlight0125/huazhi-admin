import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Store } from '../data/schema'

type StoresColumnsOptions = {
  onEditStoreName?: (store: Store) => void
  onUnbindSuccess?: () => void
  onStatusChange?: (store: Store, newStatus: string) => Promise<void>
}

function StoreStatusCell({
  store,
  onStatusChange,
}: {
  store: Store
  onStatusChange?: (store: Store, newStatus: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const enable = store.enable
  const enableValue = typeof enable === 'string' ? enable : String(enable ?? '')
  const isActive = enableValue === '1' || enable === 1

  const currentStatus = isActive ? 'Success' : 'Failed'
  /** 仅允许从 Failed 重新绑定为 Success，不允许 Success 解绑为 Failed */
  const canRebind = !isActive && !!onStatusChange
  const rebindValue = '1'

  const variant = isActive ? 'default' : 'secondary'
  const customClassName = isActive
    ? 'border-transparent bg-green-600 text-white dark:bg-green-600 dark:text-white'
    : 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'

  const handleConfirm = async () => {
    if (!onStatusChange || isActive) return
    setIsLoading(true)
    try {
      await onStatusChange(store, rebindValue)
      toast.success('Store re-bound successfully')
      setOpen(false)
    } catch (error) {
      console.error('Failed to update store status:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update store status. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation()
          if (canRebind) setOpen(true)
        }}
        className={canRebind ? 'cursor-pointer' : 'cursor-default'}
        disabled={!canRebind}
        aria-label={
          canRebind
            ? 'Re-bind store'
            : `Store status: ${currentStatus}`
        }
      >
        <Badge variant={variant} className={customClassName || undefined}>
          {currentStatus}
        </Badge>
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!isLoading) setOpen(newOpen)
        }}
        handleConfirm={handleConfirm}
        isLoading={isLoading}
        title='Re-bind store'
        desc={
          <>
            <p className='mb-2'>
              This store is currently <strong>Failed</strong> (not bound). Re-bind
              to restore <strong>Success</strong> status?
            </p>
            <p className='text-muted-foreground text-sm'>
              Store: <strong>{store.name || store.id}</strong>
            </p>
          </>
        }
        confirmText={
          isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Re-binding...
            </>
          ) : (
            'Re-bind'
          )
        }
      />
    </>
  )
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex max-w-[260px] flex-col text-left break-words whitespace-normal'>
          <span className='leading-snug font-medium'>
            {row.getValue('name') || '-'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'platform',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Type' />
    ),
    cell: ({ row }) => <div>{row.getValue('platform') || 'Offline store'}</div>,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store ID' />
    ),
    cell: ({ row }) => (
      <div className='text-sm'>{row.getValue('id') || '-'}</div>
    ),
  },
  {
    accessorKey: 'bindtime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Authorization' />
    ),
    cell: ({ row }) => {
      const bindtime = row.getValue('bindtime') as string | undefined
      if (!bindtime) {
        return <div className='text-muted-foreground text-sm'>-</div>
      }

      try {
        const date = new Date(bindtime)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()
        return (
          <div className='flex flex-col text-sm'>
            <span>{dateStr}</span>
            <span className='text-muted-foreground'>{timeStr}</span>
          </div>
        )
      } catch {
        return <div className='text-sm'>{bindtime}</div>
      }
    },
  },
  {
    accessorKey: 'enable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Status' />
    ),
    cell: ({ row }) => (
      <StoreStatusCell
        store={row.original}
        onStatusChange={options?.onStatusChange}
      />
    ),
  },
]
