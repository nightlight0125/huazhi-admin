import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { addShop } from '@/lib/api/shop'
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

interface BindShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BindShopDialog({
  open,
  onOpenChange,
  onSuccess,
}: BindShopDialogProps) {
  const user = useAuthStore((state) => state.auth.user)
  const [shopName, setShopName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    const customerId = user?.customerId || user?.id
    const accountId = user?.id

    if (!customerId || !accountId) {
      toast.error('User not found. Please login again.')
      return
    }

    if (!shopName.trim()) {
      toast.error('Please enter shop name')
      return
    }

    setIsLoading(true)
    try {
      await addShop({
        addShopVO: {
          customerId: String(customerId),
          accountId: String(accountId),
          shopName: shopName.trim(),
        },
      })
      toast.success('Shop created successfull')
      setShopName('')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to bind shop:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to bind shop. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShopName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Bind Shop</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='shop-name'>Shop Name</Label>
            <Input
              id='shop-name'
              placeholder='Enter shop name'
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Binding...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
