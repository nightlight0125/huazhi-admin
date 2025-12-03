import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type SupportTicket } from '../data/schema'

type SupportTicketsRowActionsProps = {
  row: Row<SupportTicket>
  onEdit?: (ticket: SupportTicket) => void
  onCancel?: (ticket: SupportTicket) => void
}

export function SupportTicketsRowActions({
  row,
  onEdit,
  onCancel,
}: SupportTicketsRowActionsProps) {
  const ticket = row.original

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          onClick={(e) => {
            // 防止点击菜单触发行点击
            e.stopPropagation()
          }}
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-[160px]'
        onClick={(e) => {
          // 防止菜单内部点击冒泡到行
          e.stopPropagation()
        }}
      >
        <DropdownMenuItem
          onClick={() => {
            onEdit?.(ticket)
          }}
        >
          edit
          <DropdownMenuShortcut>
            <Pencil size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onCancel?.(ticket)
          }}
          className='text-red-500'
        >
          delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


