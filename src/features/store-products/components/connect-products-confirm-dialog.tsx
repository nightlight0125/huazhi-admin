import { Info } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog'

interface ConnectProductsConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onOpenConnectionDialog?: () => void
}

export function ConnectProductsConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onOpenConnectionDialog,
}: ConnectProductsConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenConnectionDialog?.()
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <div className='flex items-start gap-3'>
            <div className='bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white'>
              <Info className='h-5 w-5' />
            </div>
            <AlertDialogDescription className='pt-0.5 text-base'>
              Please Confirm if You Need to Disconnect.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className='bg-primary text-primary-foreground'
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
