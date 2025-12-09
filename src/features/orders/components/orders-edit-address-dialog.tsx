import { type Order } from '../data/schema'
import {
  EditAddressDialog,
  type AddressData,
} from '@/components/edit-address-dialog'

interface OrdersEditAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onConfirm: (addressData: AddressData) => void
}

export function OrdersEditAddressDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: OrdersEditAddressDialogProps) {
  if (!order) return null

  return (
    <EditAddressDialog
      open={open}
      onOpenChange={onOpenChange}
      initialData={{
        customerName: order.customerName,
        address: order.address,
        city: order.city,
        country: order.country,
        province: order.province,
        postalCode: order.postalCode,
        phoneNumber: order.phoneNumber,
        email: order.email,
        shippingOrigin: order.shippingOrigin,
      }}
      onConfirm={onConfirm}
    />
  )
}
