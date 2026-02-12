import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deletePushProduct } from '@/lib/api/products'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type PublishedProduct } from '../data/schema'

type PublishedProductsRowActionsProps = {
  row: Row<PublishedProduct>
  onDeleteSuccess?: () => void
}

export function PublishedProductsRowActions({
  row,
  onDeleteSuccess,
}: PublishedProductsRowActionsProps) {
  const product = row.original
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!product.id) {
      toast.error('Product ID is required')
      return
    }

    setIsDeleting(true)
    try {
      await deletePushProduct({
        productId: product.id,
      })

      toast.success('Product deleted successfully')
      setIsDeleteDialogOpen(false)
      // 触发列表刷新
      onDeleteSuccess?.()
    } catch (error) {
      console.error('Failed to delete push product:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete product. Please try again.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        className='h-7 border-red-200 px-2 text-xs text-red-500'
        onClick={handleDeleteClick}
      >
        <Trash2 className='mr-1 h-3.5 w-3.5' />
      </Button>

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
            Delete Published Product
          </span>
        }
        desc={
          <>
            <p className='mb-2'>
              Are you sure you want to delete this published product?
              <br />
              This action cannot be undone.
            </p>
            {product.spu && (
              <p className='text-muted-foreground text-sm'>
                SPU: <strong>{product.spu}</strong>
              </p>
            )}
            {product.name && (
              <p className='text-muted-foreground text-sm'>
                Product: <strong>{product.name}</strong>
              </p>
            )}
          </>
        }
        confirmText={
          isDeleting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Deleting...
            </>
          ) : (
            'Delete'
          )
        }
      />
    </>
  )
}
