import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ProductsMutateDrawer } from './products-mutate-drawer'
import { useProducts } from './products-provider'

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()
  
  return (
    <>
      <ProductsMutateDrawer
        key='product-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <ProductsMutateDrawer
            key={`product-update-${currentRow.id}`}
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
            key='product-delete'
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
                '以下产品已被删除:'
              )
            }}
            className='max-w-md'
            title={`删除产品: ${currentRow.id} ?`}
            desc={
              <>
                您即将删除产品 <strong>{currentRow.name}</strong>。<br />
                此操作无法撤销。
              </>
            }
            confirmText='删除'
          />
        </>
      )}
    </>
  )
}
