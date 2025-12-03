import { SourcingFormDialog } from './sourcing-form-dialog'

type NewSourcingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewSourcingDialog({
  open,
  onOpenChange,
}: NewSourcingDialogProps) {
  return (
    <SourcingFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='New Sourcing'
      submitLabel='Submit'
      requireImage
      onSubmit={(values) => {
        console.log('Submit new sourcing:', values)
        onOpenChange(false)
      }}
    />
  )
}
