import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SupportTicketsReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportTicketsReasonDialog({
  open,
  onOpenChange,
}: SupportTicketsReasonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason</DialogTitle>
          <DialogDescription>数据待确认</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
