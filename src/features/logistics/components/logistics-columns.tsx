'use client'

import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Logistics } from '../data/schema'

export const createLogisticsColumns = (
  onEditShippingTo?: (row: Logistics) => void,
  onDeleteSuccess?: () => void
): ColumnDef<Logistics>[] => {
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
          aria-label='选择全部'
          className='translate-y-[2px]'
        />
      ),
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='选择行'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'sku',
      size: 150,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='SPU' />
      ),
      cell: ({ row }) => {
        const logistics = row.original
        return (
          <div className='flex items-center gap-3'>
            <div className='bg-muted h-16 w-16 flex-shrink-0 overflow-hidden rounded border'>
              {logistics.pic ? (
                <img
                  src={logistics.pic}
                  alt='Product'
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                  <div className='flex flex-col items-center gap-1'>
                    <div className='h-8 w-6 rounded-t border-2 border-gray-300 bg-white'></div>
                    <div className='h-1 w-4 rounded bg-gray-400'></div>
                  </div>
                </div>
              )}
            </div>
            <div className='space-y-0.5 text-sm'>
              <div className='font-medium'>{logistics.sku}</div>
              <div
                className='text-muted-foreground max-w-[200px] truncate'
                title={`Variant: ${logistics.variant}`}
              >
                Variant:{' '}
                {logistics.variant && logistics.variant.length > 20
                  ? `${logistics.variant.substring(0, 20)}...`
                  : logistics.variant}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'shippingMethod',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Shipping Method' />
      ),
      cell: ({ row }) => <div>{row.getValue('shippingMethod')}</div>,
    },

    {
      accessorKey: 'shippingTo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Shipping To' />
      ),
      cell: ({ row }) => <div>{row.getValue('shippingTo')}</div>,
    },
    {
      accessorKey: 'shippingTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Time' />
      ),
      cell: ({ row }) => <div>{row.getValue('shippingTime')}</div>,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const logistics = row.original
        return (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={() => onEditShippingTo?.(logistics)}
            >
              <Pencil className='mr-1 h-3.5 w-3.5' />
            </Button>
            <DeleteLogisticsDialog
              logistics={logistics}
              onSuccess={onDeleteSuccess}
            />
          </div>
        )
      },
      enableSorting: false,
      size: 150,
    },
  ]
}

type DeleteProps = {
  logistics: Logistics
  onSuccess?: () => void
}

function DeleteLogisticsDialog({ logistics, onSuccess }: DeleteProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

      const handleConfirm = async () => {
    setLoading(true)
    const loadingToast = toast.loading('Deleting...')
    try {
      // call the backend API
      const rawEntryId =
        (logistics as any).entryId ??
        (logistics as any).entry_id ??
        (logistics as any).data?.entryId ??
        (logistics as any).data?.entry_id ??
        (logistics as any).entryIdStr ??
        (logistics as any).entryid ??
        ''

      await apiClient.post('/v2/hzkj/hzkj_logistics/hzkj_cus_freight/delCus', {
        id: String(logistics.id),
        entryId: String(rawEntryId ?? ''),
      })

      toast.dismiss(loadingToast)
      toast.success('Deleted successfully')
      setOpen(false)
      // trigger refresh in parent if provided
      onSuccess?.()
    } catch (error) {
      toast.dismiss(loadingToast)
      const msg = error instanceof Error ? error.message : 'Delete failed'
      toast.error(msg)
      console.error('Delete logistics error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        className='h-7 border-red-200 px-2 text-xs text-red-500'
        onClick={() => setOpen(true)}
      >
        <Trash2 className='mr-1 h-3.5 w-3.5' />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        handleConfirm={handleConfirm}
        title={
          <span className='text-destructive'>
            <AlertTriangle
              className='stroke-destructive me-1 inline-block'
              size={18}
            />{' '}
            delete freight
          </span>
        }
        desc={`Are you sure you want to delete the freight for SKU: ${logistics.sku}?`}
        confirmText='Delete'
        destructive
        isLoading={loading}
      />
    </>
  )
}
