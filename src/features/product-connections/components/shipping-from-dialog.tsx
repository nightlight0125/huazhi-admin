import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { shippingFromOptions } from '../data/data'
import { type ProductConnection } from '../data/schema'

interface ShippingFromDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productConnection: ProductConnection | null
  onSave: (productId: string, newShippingFrom: string) => void
}

export function ShippingFromDialog({
  open,
  onOpenChange,
  productConnection,
  onSave,
}: ShippingFromDialogProps) {
  const [selectedShippingFrom, setSelectedShippingFrom] = useState(
    productConnection?.shippingFrom || ''
  )

  const handleSave = () => {
    if (productConnection && selectedShippingFrom) {
      onSave(productConnection.id, selectedShippingFrom)
      onOpenChange(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && productConnection) {
      setSelectedShippingFrom(productConnection.shippingFrom)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>设置发货地</DialogTitle>
          <DialogDescription>
            为产品 "{productConnection?.productName}" 设置发货地
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>选择发货地</label>
            <Select value={selectedShippingFrom} onValueChange={setSelectedShippingFrom}>
              <SelectTrigger>
                <SelectValue placeholder='请选择发货地' />
              </SelectTrigger>
              <SelectContent>
                {shippingFromOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!selectedShippingFrom}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
