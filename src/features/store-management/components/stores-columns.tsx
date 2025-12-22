import { useState } from 'react'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Store } from '../data/schema'

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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Name' />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className='flex max-w-[260px] flex-col text-left break-words whitespace-normal'>
          <span className='leading-snug font-medium'>
            {row.getValue('name') || '-'}
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
    accessorKey: 'platform',
    size: 140,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Type' />
    ),
    cell: ({ row }) => <div>{row.getValue('platform') || '-'}</div>,
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
      <DataTableColumnHeader column={column} title='Authorization Time' />
    ),
    cell: ({ row }) => {
      const bindtime = row.getValue('bindtime') as string | undefined
      if (!bindtime) {
        return <div className='text-muted-foreground text-sm'>-</div>
      }

      // 格式化时间显示
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
    accessorKey: 'createtime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Create Time' />
    ),
    cell: ({ row }) => {
      const createtime = row.getValue('createtime') as string | undefined
      if (!createtime) {
        return <div className='text-muted-foreground text-sm'>-</div>
      }

      // 格式化时间显示
      try {
        const date = new Date(createtime)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()
        return (
          <div className='flex flex-col text-sm'>
            <span>{dateStr}</span>
            <span className='text-muted-foreground'>{timeStr}</span>
          </div>
        )
      } catch {
        return <div className='text-sm'>{createtime}</div>
      }
    },
  },
  {
    accessorKey: 'enable',
    size: 130,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store Status' />
    ),
    cell: ({ row }) => {
      const enable = row.getValue('enable')
      const enableValue =
        typeof enable === 'string' ? enable : String(enable ?? '')
      const isActive = enableValue === '1' || enable === 1

      const status = isActive ? 'Success' : 'Failed'
      const variant = isActive ? 'default' : 'secondary'
      const customClassName = isActive
        ? 'border-transparent bg-green-600 text-white dark:bg-green-600 dark:text-white'
        : 'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'

      return (
        <Badge variant={variant} className={customClassName || undefined}>
          {status}
        </Badge>
      )
    },
  },

  {
    id: 'actions',
    size: 60,
    header: () => <span className='sr-only'>Actions</span>,
    cell: ({ row }) => <StoreDeleteCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]

// 单行删除弹框
interface StoreDeleteCellProps {
  row: Row<Store>
}

function StoreDeleteCell({ row }: StoreDeleteCellProps) {
  const [open, setOpen] = useState(false)
  const store = row.original

  const handleConfirmDelete = () => {
    // TODO: integrate real delete API for store management
    console.log('Delete store:', store.id || store.name)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        className='h-7 border-red-200 px-2 text-xs text-red-500'
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Trash2 className='mr-1 h-3.5 w-3.5' />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        handleConfirm={handleConfirmDelete}
        destructive
        title={<span className='text-destructive'>Delete Store</span>}
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this store?
              <br />
              This action cannot be undone.
            </p>
            <p className='text-muted-foreground text-sm'>
              Store: <strong>{store.name || store.id}</strong>
            </p>
          </>
        }
        confirmText='Delete'
      />
    </>
  )
}
