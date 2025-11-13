import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StoreProductsImportDialog } from './store-products-import-dialog'
import { StoreProductsMutateDrawer } from './store-products-mutate-drawer'
import { useStoreProducts } from './store-products-provider'

export function StoreProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStoreProducts()
  return (
    <>
      <StoreProductsMutateDrawer
        key='store-product-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <StoreProductsImportDialog
        key='store-products-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <StoreProductsMutateDrawer
            key={`store-product-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='store-product-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following store product has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete this store product: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a store product with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}

