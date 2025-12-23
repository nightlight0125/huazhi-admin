import { useState } from 'react'
import { Calendar, RefreshCw } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { stores } from '../data/data'

interface OrdersSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrdersSyncDialog({
  open,
  onOpenChange,
}: OrdersSyncDialogProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [syncDays, setSyncDays] = useState<string>('7')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncAllStores, setSyncAllStores] = useState(false)

  // 天数选项
  const dayOptions = [
    { label: '最近1天', value: '1' },
    { label: '最近3天', value: '3' },
    { label: '最近7天', value: '7' },
    { label: '最近15天', value: '15' },
    { label: '最近30天', value: '30' },
    { label: '最近90天', value: '90' },
  ]

  // 处理店铺选择
  const handleStoreToggle = (storeValue: string) => {
    if (selectedStores.includes(storeValue)) {
      setSelectedStores(selectedStores.filter((store) => store !== storeValue))
    } else {
      setSelectedStores([...selectedStores, storeValue])
    }
  }

  // 处理全选店铺
  const handleSelectAllStores = (checked: boolean) => {
    setSyncAllStores(checked)
    if (checked) {
      setSelectedStores(stores.map((store) => store.value))
    } else {
      setSelectedStores([])
    }
  }

  // 处理同步
  const handleSync = async () => {
    if (!syncAllStores && selectedStores.length === 0) {
      alert('请至少选择一个店铺')
      return
    }

    setIsSyncing(true)

    try {
      // 模拟同步过程
      const storesToSync = syncAllStores
        ? '所有店铺'
        : selectedStores.join(', ')
      console.log('开始同步订单:', {
        stores: storesToSync,
        days: syncDays,
        allStores: syncAllStores,
      })

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert(`同步完成！\n店铺: ${storesToSync}\n天数: ${syncDays}天`)
      onOpenChange(false)

      // 重置状态
      setSelectedStores([])
      setSyncDays('7')
      setSyncAllStores(false)
    } catch (error) {
      console.error('同步失败:', error)
      alert('同步失败，请重试')
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
      setSyncDays('7')
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
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='sync-all-stores'
                checked={syncAllStores}
                onCheckedChange={handleSelectAllStores}
              />
              <Label htmlFor='sync-all-stores' className='font-medium'>
                Sync all stores
              </Label>
            </div>

            {!syncAllStores && (
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Select stores</Label>
                <div className='grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2'>
                  {stores.map((store) => (
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
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 天数选择 */}
          <div className='space-y-2'>
            <Label
              htmlFor='sync-days'
              className='flex items-center gap-2 text-sm font-medium'
            >
              <Calendar className='h-4 w-4' />
              Sync days
            </Label>
            <Select value={syncDays} onValueChange={setSyncDays}>
              <SelectTrigger>
                <SelectValue placeholder='Sync days' />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 同步信息 */}
          <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
            <div className='text-sm font-medium'>Sync information</div>
            <div className='text-muted-foreground space-y-1 text-sm'>
              <div>
                Stores:{' '}
                {syncAllStores
                  ? 'All stores'
                  : selectedStores.length > 0
                    ? selectedStores
                        .map(
                          (store) =>
                            stores.find((s) => s.value === store)?.label
                        )
                        .join(', ')
                    : 'Not selected'}
              </div>
              <div>
                Days:{' '}
                {dayOptions.find((option) => option.value === syncDays)?.label}
              </div>
              <div>
                Expected sync:{' '}
                {syncAllStores || selectedStores.length > 0
                  ? 'In progress...'
                  : 'Please select stores'}
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
