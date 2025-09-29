import { OrdersCreateDialog } from './orders-create-dialog'
import { OrdersUpdateDialog } from './orders-update-dialog'
import { OrdersDeleteDialog } from './orders-delete-dialog'
import { OrdersImportDialog } from './orders-import-dialog'
import { OrdersSyncDialog } from './orders-sync-dialog'
import { useOrders } from './orders-provider'

export function OrdersDialogs() {
  const { open, setOpen } = useOrders()

  return (
    <>
      <OrdersCreateDialog open={open === 'create'} onOpenChange={(state) => setOpen(state ? 'create' : null)} />
      <OrdersUpdateDialog open={open === 'update'} onOpenChange={(state) => setOpen(state ? 'update' : null)} />
      <OrdersDeleteDialog open={open === 'delete'} onOpenChange={(state) => setOpen(state ? 'delete' : null)} />
      <OrdersImportDialog open={open === 'import'} onOpenChange={(state) => setOpen(state ? 'import' : null)} />
      <OrdersSyncDialog open={open === 'sync'} onOpenChange={(state) => setOpen(state ? 'sync' : null)} />
    </>
  )
}
