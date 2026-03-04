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
import { type Order } from '../data/schema'

interface OrdersEditCustomerNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onConfirm: (customerName: string) => void
}

export function OrdersEditCustomerNameDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: OrdersEditCustomerNameDialogProps) {
  const [name, setName] = useState('')

  // Initialize form with order data (customerName may be locale object { zh_CN, zh_TW, GLang })
  useEffect(() => {
    if (order && open) {
      const raw = (order as any).customerName
      const str =
        typeof raw === 'string'
          ? raw
          : raw && typeof raw === 'object'
            ? (raw.GLang || raw.zh_CN || raw.zh_TW) || ''
            : ''
      setName(str)
    }
  }, [order, open])

  const handleConfirm = () => {
    if (!name.trim()) {
      return
    }

    onConfirm(name.trim())
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (order) {
      const raw = (order as any).customerName
      const str =
        typeof raw === 'string'
          ? raw
          : raw && typeof raw === 'object'
            ? (raw.GLang || raw.zh_CN || raw.zh_TW) || ''
            : ''
      setName(str)
    }
    onOpenChange(false)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Customer Name</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <div className='space-y-2'>
            <Label htmlFor='customer-name'>
              Customer Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='customer-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter customer name'
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={!name.trim()}
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

