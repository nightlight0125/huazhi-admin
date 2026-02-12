import { saveBill } from '@/lib/api/sourcing'
import { useAuthStore } from '@/stores/auth-store'
import { useState } from 'react'
import { toast } from 'sonner'
import { type Sourcing } from '../data/schema'
import { SourcingFormDialog } from './sourcing-form-dialog'

type EditSourcingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourcing: Sourcing | null
  onSuccess?: () => void
}

export function EditSourcingDialog({
  open,
  onOpenChange,
  sourcing,
  onSuccess,
}: EditSourcingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { auth } = useAuthStore()

  // 格式化时间为 "YYYY-MM-DD HH:mm:ss" 格式
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const handleSubmit = async (values: {
    productName: string
    productLink: string
    price?: string
    remark?: string
    productImage?: string
  }) => {
    if (!sourcing) {
      toast.error('Sourcing data not found')
      return
    }

    const customerId = auth.user?.customerId || auth.user?.id

    if (!customerId) {
      toast.error('Please login to save sourcing request')
      return
    }

    setIsSubmitting(true)
    try {
      await saveBill({
        id: sourcing.id,
        createtime: formatDateTime(sourcing.createdTime),
        hzkj_goodname: values.productName,
        hzkj_url: values.productLink,
        hzkj_amount: values.price || undefined,
        hzkj_textfield: values.remark || undefined,
        hzkj_picturefield: values.productImage || undefined,
        hzkj_target_quality: 'A',
        hzkj_combofield1: '0',
        hzkj_accept_status: '0',
        hzkj_customer_id: String(customerId),
        hzkj_api: true,
      })

      toast.success('Sourcing request saved successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save sourcing request:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save sourcing request. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SourcingFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Sourcing'
      submitLabel={isSubmitting ? 'Saving...' : 'Save'}
      requireImage={false}
      initialValues={
        sourcing
          ? {
              productName: sourcing.productName,
              productLink: sourcing.url ?? '',
              price: sourcing.price ? String(sourcing.price) : '',
              remark: sourcing.remark ?? '',
              imageUrl:
                sourcing.images && sourcing.images.length > 0
                  ? sourcing.images[0]
                  : null,
            }
          : undefined
      }
      onSubmit={handleSubmit}
    />
  )
}
