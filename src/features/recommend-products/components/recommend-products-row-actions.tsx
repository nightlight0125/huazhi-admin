import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { AlertTriangle, Store, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { delRecommendProducts } from '@/lib/api/products'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type RecommendProduct } from '../data/schema'

type RecommendProductsRowActionsProps = {
  row: Row<RecommendProduct>
  onDeleteSuccess?: () => void
}

export function RecommendProductsRowActions({
  row,
  onDeleteSuccess,
}: RecommendProductsRowActionsProps) {
  const product = row.original
  const { auth } = useAuthStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Cannot delete: missing customer ID')
      return
    }

    if (!product.id) {
      toast.error('Cannot delete: missing product ID')
      return
    }

    setIsDeleting(true)
    try {
      await delRecommendProducts({
        customerId: String(customerId),
        productIds: [product.id],
      })

      toast.success('Recommend product deleted successfully')
      setIsDeleteDialogOpen(false)
      onDeleteSuccess?.()
    } catch (error) {
      console.error('Failed to delete recommend product:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete recommend product. Please try again.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='h-7 px-2 text-xs'
          onClick={(e) => {
            e.stopPropagation()
            console.log('Publish recommend product to store:', product.id)
          }}
        >
          <Store className='mr-1 h-3.5 w-3.5' />
          Publish
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-7 border-red-200 px-2 text-xs text-red-500'
          onClick={handleDeleteClick}
        >
          <Trash2 className='mr-1 h-3.5 w-3.5' />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
        }}
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={isDeleting}
        title={
          <span className='text-destructive'>
            <AlertTriangle
              className='stroke-destructive me-1 inline-block'
              size={18}
            />{' '}
            Delete Recommend Product
          </span>
        }
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this recommend product?
              <br />
              This action cannot be undone.
            </p>
            {product.spu && (
              <p className='text-muted-foreground text-sm'>
                SPU: <strong>{product.spu}</strong>
              </p>
            )}
          </>
        }
        confirmText='Delete'
      />
    </>
  )
}
