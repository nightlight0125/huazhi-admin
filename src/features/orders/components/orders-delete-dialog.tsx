import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useOrders } from './orders-provider'

interface OrdersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean | null) => void
}

export function OrdersDeleteDialog({ open, onOpenChange }: OrdersDeleteDialogProps) {
  const { currentRow } = useOrders()

  const handleDelete = () => {
    if (currentRow) {
      // 这里应该调用 API 删除订单
      console.log('删除订单:', currentRow.id)
      onOpenChange(false)
    }
  }

  if (!currentRow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            您确定要删除订单 <strong>{currentRow.platformOrderNumber}</strong> 吗？
            此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
