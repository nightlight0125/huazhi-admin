import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { syncShopOrders } from '@/lib/api/orders'
import { getUserShopOptions, type ShopOption } from '@/lib/utils/shop-utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface OrdersSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersSyncDialog({
  open,
  onOpenChange,
}: OrdersSyncDialogProps) {
  const { auth } = useAuthStore()
  const [stores, setStores] = useState<ShopOption[]>([])
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncAllStores, setSyncAllStores] = useState(false)

  // 获取店铺列表
  useEffect(() => {
    const fetchStores = async () => {
      const userId = auth.user?.id
      if (!userId) {
        setStores([])
        return
      }

      setIsLoadingStores(true)
      try {
        const options = await getUserShopOptions(String(userId))
        setStores(options)
      } catch (error) {
        console.error('获取店铺列表失败:', error)
        setStores([])
      } finally {
        setIsLoadingStores(false)
      }
    }

    if (open) {
      void fetchStores()
    }
  }, [auth.user?.id, open])

  // 处理店铺选择
  const handleStoreToggle = (storeValue: string) => {
    if (selectedStores.includes(storeValue)) {
      setSelectedStores(selectedStores.filter((store) => store !== storeValue))
    } else {
      setSelectedStores([...selectedStores, storeValue])
    }
  }

  // 处理同步
  const handleSync = async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    if (!syncAllStores && selectedStores.length === 0) {
      toast.error('Please select at least one store')
      return
    }

    setIsSyncing(true)

    try {
      // 确定要同步的店铺ID列表
      const shopIds = syncAllStores
        ? stores.map((store) => store.value)
        : selectedStores

      if (shopIds.length === 0) {
        toast.error('No stores selected')
        return
      }

      // 调用同步接口
      await syncShopOrders({
        customerId: String(customerId),
        shopIds: shopIds,
      })

      const storesToSync = syncAllStores
        ? 'All stores'
        : stores
            .filter((store) => selectedStores.includes(store.value))
            .map((store) => store.label)
            .join(', ')

      toast.success(`Sync completed successfully!\nStores: ${storesToSync}`)
      onOpenChange(false)

      // 重置状态
      setSelectedStores([])
      setSyncAllStores(false)
    } catch (error) {
      console.error('同步失败:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sync orders. Please try again.'
      )
    } finally {
      setIsSyncing(false)
    }
  }

  // 处理对话框关闭
  const handleClose = () => {
    if (!isSyncing) {
      onOpenChange(false)
      // 重置状态
      setSelectedStores([])
      setSyncAllStores(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RefreshCw className='h-5 w-5' />
            Orders Sync
          </DialogTitle>
          <DialogDescription>
            Sync orders from selected stores within the specified number of days
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* 店铺选择 */}
          <div className='space-y-3'>
            {!syncAllStores && (
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Select stores</Label>
                <div className='grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2'>
                  {isLoadingStores ? (
                    <div className='text-muted-foreground col-span-2 flex items-center justify-center py-4 text-sm'>
                      Loading stores...
                    </div>
                  ) : stores.length === 0 ? (
                    <div className='text-muted-foreground col-span-2 flex items-center justify-center py-4 text-sm'>
                      No stores available
                    </div>
                  ) : (
                    stores.map((store) => (
                      <div
                        key={store.value}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`store-${store.value}`}
                          checked={selectedStores.includes(store.value)}
                          onCheckedChange={() => handleStoreToggle(store.value)}
                        />
                        <Label
                          htmlFor={`store-${store.value}`}
                          className='text-sm'
                        >
                          {store.label}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSyncing}>
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={
              isSyncing || (!syncAllStores && selectedStores.length === 0)
            }
            className='min-w-[100px]'
          >
            {isSyncing ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className='mr-2 h-4 w-4' />
                Start sync
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
