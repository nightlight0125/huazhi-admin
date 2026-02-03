import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type SupportTicket, type SupportTicketStatus } from '../data/schema'

interface SupportTicketDeleteCellProps {
  row: Row<SupportTicket>
  onDelete?: (orderId: string) => void | Promise<void>
}

function SupportTicketDeleteCell({ row, onDelete }: SupportTicketDeleteCellProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const ticket = row.original

  const handleConfirmDelete = async () => {
    if (!onDelete) return

    setIsLoading(true)
    try {
      await onDelete(ticket.id)
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete support ticket:', error)
    } finally {
      setIsLoading(false)
    }
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
        onOpenChange={(newOpen) => {
          if (!isLoading) {
            setOpen(newOpen)
          }
        }}
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={isLoading}
        title={<span className='text-destructive'>Delete Support Ticket</span>}
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this support ticket?
              <br />
              This action cannot be undone.
            </p>
            {ticket.supportTicketNo && (
              <p className='text-muted-foreground text-sm'>
                Support Ticket No: <strong>{ticket.supportTicketNo}</strong>
              </p>
            )}
          </>
        }
        confirmText={
          isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Deleting...
            </>
          ) : (
            'Delete'
          )
        }
      />
    </>
  )
}

export const createSupportTicketsColumns = (options?: {
  onEdit?: (ticket: SupportTicket) => void
  onDelete?: (orderId: string) => void | Promise<void>
  onReasonClick?: (ticket: SupportTicket) => void
}): ColumnDef<SupportTicket>[] => {
  const { onEdit, onDelete, onReasonClick } = options || {}

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
    },
    {
      accessorKey: 'supportTicketNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No.' />
      ),
      cell: ({ row }) => {
        return <div className='font-medium'>{row.original?.number}</div>
      },
    },
    {
      id: 'hzOrder',
      header: 'Order',
      cell: ({ row }) => {
        const ticket = row.original
        return (
          <div className='flex items-center gap-3'>
            {ticket.productImage ? (
              <img
                src={ticket.productImage}
                alt={ticket.hzSku}
                className='h-12 w-12 flex-shrink-0 rounded border object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className='bg-muted h-12 w-12 flex-shrink-0 rounded border'>
                <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                  No Image
                </div>
              </div>
            )}
            <div className='space-y-0.5 text-sm'>
              <div>Order NO: {ticket.hzOrderNo || '--'}</div>
              <div>SKU: {ticket.hzSku || '--'}</div>
              <div>Variant: {ticket.variant || '--'}</div>
              <div>QTY: {ticket.qty || 0}</div>
              <div>Total Price: ${(ticket.totalPrice || 0).toFixed(2)}</div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: 'returnQty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Qty' />
      ),
      cell: ({ row }) => {
        // qty 是 hzkj_after_entryentity 中的 item 数组中的 hzkj_qty（在转换时已经映射到 returnQty）
        return (
          <div className='w-10 text-center text-xs'>
            {row.getValue('returnQty') || 0}
          </div>
        )
      },
      size: 40,
    },
    {
      accessorKey: 'storeName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Store Name' />
      ),
      cell: ({ row }) => {
        const ticket = row.original
        console.log('ticket', ticket)
        return <div>{ticket.hzkj_shop_name}</div>
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const ticket = row.original
        return <div>{ticket.hzkj_sales_type_title}</div>
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const rawStatus = row.getValue('status') as SupportTicket['status']
        const status: Exclude<SupportTicketStatus, 'all'> = 
          rawStatus && ['processing', 'finished', 'refused', 'cancelled'].includes(rawStatus)
            ? rawStatus
            : 'processing'
        const statusConfig: Record<
          Exclude<SupportTicketStatus, 'all'>,
          { label: string; className: string }
        > = {
          processing: {
            label: 'Processing',
            className:
              'border-transparent bg-purple-500 text-white dark:bg-purple-500 dark:text-white capitalize',
          },
          finished: {
            label: 'Finished',
            className:
              'border-transparent bg-green-500 text-white dark:bg-green-500 dark:text-white capitalize',
          },
          refused: {
            label: 'Refused',
            className:
              'border-transparent bg-red-500 text-white dark:bg-red-500 dark:text-white capitalize',
          },
          cancelled: {
            label: 'Cancelled',
            className:
              'border-transparent bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize',
          },
        }
        const config = statusConfig[status]
        return (
          <Badge variant='outline' className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'createTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Create Time' />
      ),
      cell: ({ row }) => <div>{row.getValue('createTime')}</div>,
    },
    {
      accessorKey: 'reason',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='reason' />
      ),
      cell: ({ row }) => {
        const ticket = row.original
        const reason = (row.getValue('reason') as string) || '---'
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className='text-muted-foreground max-w-[120px] cursor-pointer truncate text-xs'
                onClick={(e) => {
                  e.stopPropagation()
                  onReasonClick?.(ticket)
                }}
              >
                {reason}
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-xs text-xs'>
              {reason}
            </TooltipContent>
          </Tooltip>
        )
      },
      size: 140,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const ticket = row.original

        return (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(ticket)
              }}
            >
              <Pencil className='mr-1 h-3.5 w-3.5' />
            </Button>
            <SupportTicketDeleteCell row={row} onDelete={onDelete} />
          </div>
        )
      },
      enableSorting: false,
      size: 150,
    },
  ]
}
