import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAddresses } from './addresses-provider'

export function AddressesPrimaryButtons() {
  const { setOpen } = useAddresses()
  return (
    <div className='flex gap-2'>
      <Button
        variant='default'
        className='space-x-1'
        onClick={() => setOpen('add')}
      >
        <Plus size={18} />
        <span>Add Address</span>
      </Button>
    </div>
  )
}

