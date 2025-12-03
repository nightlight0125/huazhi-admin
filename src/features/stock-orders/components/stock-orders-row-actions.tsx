import { type Row } from '@tanstack/react-table'
import { CreditCard, Edit3, Package, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type StockOrder } from '../data/schema'

interface StockOrdersRowActionsProps {
  row: Row<StockOrder>
  onPay?: (orderId: string) => void
  onEditAddress?: (orderId: string) => void
  onAddPackage?: (orderId: string) => void
  onDelete?: (orderId: string) => void
}

export function StockOrdersRowActions({
  row,
  onPay,
  onEditAddress,
  onAddPackage,
  onDelete,
}: StockOrdersRowActionsProps) {
  const order = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Open menu'
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className='h-4 w-4' aria-hidden='true' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-[160px]'
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={() => {
            onPay?.(order.id)
          }}
        >
          <CreditCard className='mr-2 h-4 w-4' />
          Pay
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onEditAddress?.(order.id)
          }}
        >
          <Edit3 className='mr-2 h-4 w-4' />
          Edit Adress
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onAddPackage?.(order.id)
          }}
        >
          <Package className='mr-2 h-4 w-4' />
          Add Package
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-red-600 focus:text-red-700'
          onClick={() => {
            onDelete?.(order.id)
          }}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


