import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Link2, Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type StoreSku } from '../data/schema'

type PackagingConnectionRowActionsProps = {
  row: Row<StoreSku>
  isConnectedFilter: boolean
  onConnect?: (storeSku: StoreSku) => void
  onDisconnect?: (storeSku: StoreSku) => void
}

export function PackagingConnectionRowActions({
  row,
  isConnectedFilter,
  onConnect,
  onDisconnect,
}: PackagingConnectionRowActionsProps) {
  const item = row.original

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        {isConnectedFilter ? (
          <DropdownMenuItem
            onClick={() => {
              onConnect?.(item)
            }}
          >
            connect
            <DropdownMenuShortcut>
              <Link2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              onDisconnect?.(item)
            }}
          >
            disconnect
            <DropdownMenuShortcut>
              <Link2Off size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


