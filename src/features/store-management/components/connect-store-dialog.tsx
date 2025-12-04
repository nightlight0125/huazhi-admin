import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConnectStoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platformName: string
  onNext: () => void
}

export function ConnectStoreDialog({
  open,
  onOpenChange,
  platformName,
  onNext,
}: ConnectStoreDialogProps) {
  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleNext = () => {
    onNext()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Connect Store</DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-muted-foreground text-sm'>
            Connect with {platformName} store
          </p>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
