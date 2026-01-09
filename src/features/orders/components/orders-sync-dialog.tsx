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

  // 处理全选/取消全选
  const handleSyncAllToggle = (checked: boolean) => {
    setSyncAllStores(checked)
    if (checked) {
      // 全选时，将所有店铺添加到选中列表
      setSelectedStores(stores.map((store) => store.value))
    } else {
      // 取消全选时，清空选中列表
      setSelectedStores([])
    }
  }

  // 处理店铺选择
  const handleStoreToggle = (storeValue: string) => {
    if (selectedStores.includes(storeValue)) {
      const newSelected = selectedStores.filter((store) => store !== storeValue)
      setSelectedStores(newSelected)
      // 如果取消选择后，选中的店铺数量少于总店铺数，取消全选状态
      if (syncAllStores && newSelected.length < stores.length) {
        setSyncAllStores(false)
      }
    } else {
      const newSelected = [...selectedStores, storeValue]
      setSelectedStores(newSelected)
      // 如果所有店铺都被选中，自动勾选全选
      if (newSelected.length === stores.length) {
        setSyncAllStores(true)
      }
    }
  }

  // 处理同步
  const handleSync = async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found')
      return
    }

    if (selectedStores.length === 0) {
      toast.error('Please select at least one store')
      return
    }

    setIsSyncing(true)

    try {
      // 使用选中的店铺ID列表
      const shopIds = selectedStores

      if (shopIds.length === 0) {
        toast.error('No stores selected')
        return
      }

      // 调用同步接口
      await syncShopOrders({
        customerId: String(customerId),
        shopIds: shopIds,
      })

      const storesToSync = stores
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
            {/* 全部店铺开关 */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='sync-all-stores'
                checked={syncAllStores}
                onCheckedChange={handleSyncAllToggle}
              />
              <Label htmlFor='sync-all-stores' className='text-sm font-medium'>
                Sync all stores
              </Label>
            </div>

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
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSyncing}>
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={isSyncing || selectedStores.length === 0}
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
