import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { type SupportTicket } from '../data/schema'
import { SupportTicketsRowActions } from './support-tickets-row-actions'

export const createSupportTicketsColumns = (options?: {
  onEdit?: (ticket: SupportTicket) => void
  onCancel?: (ticket: SupportTicket) => void
  onReasonClick?: (ticket: SupportTicket) => void
}): ColumnDef<SupportTicket>[] => {
  const { onEdit, onCancel, onReasonClick } = options || {}

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
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('supportTicketNo')}</div>
      ),
    },
    {
      id: 'hzOrder',
      header: 'HZ Order',
      cell: ({ row }) => {
        const ticket = row.original
        return (
          <div className='flex items-center gap-3'>
            <div className='bg-muted h-12 w-12 flex-shrink-0 rounded border'>
              {/* Placeholder for product image */}
              <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                Image
              </div>
            </div>
            <div className='space-y-0.5 text-sm'>
              <div>HZ Order NO: {ticket.hzOrderNo}</div>
              <div>HZ SKU: {ticket.hzSku}</div>
              <div>Variant: {ticket.variant}</div>
              <div>QTY: {ticket.qty}</div>
              <div>Total Price: ${ticket.totalPrice}</div>
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
      cell: ({ row }) => (
        <div className='w-10 text-xs text-center'>
          {row.getValue('returnQty')}
        </div>
      ),
      size: 40,
    },
    {
      accessorKey: 'storeName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Store Name' />
      ),
      cell: ({ row }) => <div>{row.getValue('storeName')}</div>,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => <div>{row.getValue('type')}</div>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as SupportTicket['status']
        const statusConfig = {
          processing: { label: 'Processing', variant: 'default' as const },
          finished: { label: 'Finished', variant: 'secondary' as const },
          refused: { label: 'Refused', variant: 'destructive' as const },
          cancelled: { label: 'Cancelled', variant: 'outline' as const },
        }
        const config = statusConfig[status] || statusConfig.processing
        return (
          <Badge variant={config.variant} className='capitalize'>
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
        return (
          <SupportTicketsRowActions
            row={row}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        )
      },
      enableSorting: false,
      size: 150,
    },
  ]
}
