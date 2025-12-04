import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EditStoreNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeName: string
  onConfirm: (newStoreName: string) => void
}

export function EditStoreNameDialog({
  open,
  onOpenChange,
  storeName,
  onConfirm,
}: EditStoreNameDialogProps) {
  const [name, setName] = useState('')

  // Initialize form with store name
  useEffect(() => {
    if (open) {
      setName(storeName)
    }
  }, [storeName, open])

  const handleConfirm = () => {
    if (!name.trim()) {
      return
    }
    onConfirm(name.trim())
    onOpenChange(false)
  }

  const handleCancel = () => {
    setName(storeName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Store Name</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='store-name'>
              Store Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='store-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter store name'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!name.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

