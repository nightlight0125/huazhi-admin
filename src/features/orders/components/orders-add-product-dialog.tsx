import { useState } from 'react'
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
import { type OrderProduct } from '../data/schema'

interface OrdersAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (product: OrderProduct) => void
}

export function OrdersAddProductDialog({
  open,
  onOpenChange,
  onConfirm,
}: OrdersAddProductDialogProps) {
  const [sku, setSku] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleConfirm = () => {
    if (!sku.trim() || !title.trim()) return

    const newProduct: OrderProduct = {
      id: sku.trim(),
      productName: title.trim(),
      productVariant: [],
      quantity,
      productImageUrl: imageUrl.trim(),
      productLink: '',
      price: 0,
      totalPrice: 0,
    }

    onConfirm(newProduct)
    setSku('')
    setTitle('')
    setImageUrl('')
    setQuantity(1)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSku('')
    setTitle('')
    setImageUrl('')
    setQuantity(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto py-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='sku'>
                  SKU <span className='text-orange-500'>*</span>
                </Label>
                <Input
                  id='sku'
                  placeholder='Please enter the SKU'
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='quantity'>
                  Quantity <span className='text-orange-500'>*</span>
                </Label>
                <Input
                  id='quantity'
                  type='number'
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title'>
                Title <span className='text-orange-500'>*</span>
              </Label>
              <Input
                id='title'
                placeholder='Please enter the product title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='imageUrl'>Image URL</Label>
              <Input
                id='imageUrl'
                placeholder='Please enter the image URL'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={!sku.trim() || !title.trim()}
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
