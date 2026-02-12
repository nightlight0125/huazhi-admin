import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { saveBill } from '@/lib/api/sourcing'
import { SourcingFormDialog } from './sourcing-form-dialog'

type NewSourcingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NewSourcingDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewSourcingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { auth } = useAuthStore()

  const handleSubmit = async (values: {
    productName: string
    productLink: string
    price?: string
    remark?: string
    productImage?: string
  }) => {
    const customerId = auth.user?.customerId

    if (!customerId) {
      toast.error('Please login to submit sourcing request')
      return
    }

    setIsSubmitting(true)
    try {
      await saveBill({
        hzkj_goodname: values.productName,
        hzkj_url: values.productLink,
        hzkj_amount: values.price || undefined,
        hzkj_textfield: values.remark || undefined,
        hzkj_picturefield: values.productImage || undefined,
        hzkj_target_quality: 'A',
        hzkj_combofield1: '0',
        hzkj_accept_status: '0',
        hzkj_customer_id: String(customerId),
      })

      toast.success('Sourcing request submitted successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit sourcing request:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to submit sourcing request. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SourcingFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='New Sourcing'
      submitLabel={isSubmitting ? 'Submitting...' : 'Submit'}
      requireImage
      onSubmit={handleSubmit}
    />
  )
}
