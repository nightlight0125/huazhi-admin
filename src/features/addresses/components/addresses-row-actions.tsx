import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { TRASH_DELETE_ICON_CLASS } from '@/lib/delete-action-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { type Address } from '../data/schema'
import { useAddresses } from './addresses-provider'

interface AddressesRowActionsProps {
  row: Row<Address>
}

export function AddressesRowActions({ row }: AddressesRowActionsProps) {
  const { setCurrentRow, setOpen } = useAddresses()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='h-7 px-2 text-xs'
        onClick={(e) => {
          e.stopPropagation()
          setCurrentRow(row.original)
          setOpen('edit')
        }}
      >
        <Pencil className='mr-1 h-3.5 w-3.5' />
        Edit
      </Button>
      <Button
        variant='outline'
        size='sm'
        className='group h-7 border-gray-200 px-2 text-xs text-gray-500 hover:border-red-200 hover:text-red-600'
        onClick={(e) => {
          e.stopPropagation()
          setCurrentRow(row.original)
          setOpen('delete')
        }}
      >
        <Trash2
          className={cn(TRASH_DELETE_ICON_CLASS, 'mr-1 h-3.5 w-3.5')}
        />
      </Button>
    </div>
  )
}
