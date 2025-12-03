import { type Sourcing } from '../data/schema'
import { SourcingFormDialog } from './sourcing-form-dialog'

type EditSourcingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourcing: Sourcing | null
}

export function EditSourcingDialog({
  open,
  onOpenChange,
  sourcing,
}: EditSourcingDialogProps) {
  return (
    <SourcingFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Sourcing'
      submitLabel='Save'
      requireImage={false}
      initialValues={
        sourcing
          ? {
              productName: sourcing.productName,
              productLink: sourcing.url ?? '',
              price: '',
              remark: sourcing.remark ?? '',
              imageUrl:
                sourcing.images && sourcing.images.length > 0
                  ? sourcing.images[0]
                  : null,
            }
          : undefined
      }
      onSubmit={(values) => {
        console.log('Edit sourcing:', sourcing?.id, values)
        onOpenChange(false)
      }}
    />
  )
}
