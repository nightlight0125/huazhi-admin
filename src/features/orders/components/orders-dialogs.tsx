import { OrdersCreateDialog } from './orders-create-dialog'
import { OrdersUpdateDialog } from './orders-update-dialog'
import { OrdersDeleteDialog } from './orders-delete-dialog'
import { OrdersImportDialog } from './orders-import-dialog'
import { useOrders } from './orders-provider'

export function OrdersDialogs() {
  const { open, setOpen } = useOrders()

  return (
    <>
      <OrdersCreateDialog open={open === 'create'} onOpenChange={setOpen} />
      <OrdersUpdateDialog open={open === 'update'} onOpenChange={setOpen} />
      <OrdersDeleteDialog open={open === 'delete'} onOpenChange={setOpen} />
      <OrdersImportDialog open={open === 'import'} onOpenChange={setOpen} />
    </>
  )
}
