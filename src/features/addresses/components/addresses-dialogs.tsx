import { AddressesActionDialog } from './addresses-action-dialog'
import { AddressesDeleteDialog } from './addresses-delete-dialog'
import { useAddresses } from './addresses-provider'

export function AddressesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAddresses()
  return (
    <>
      <AddressesActionDialog
        key='address-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AddressesActionDialog
            key={`address-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AddressesDeleteDialog
            key={`address-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}

