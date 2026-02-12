import { EditAddressDialog, type AddressData } from '@/components/edit-address-dialog'
import { type Order } from '../data/schema'

interface OrdersEditAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onConfirm: (addressData: AddressData) => void
}

// 根据后端返回的 hzkj_country_id / hzkj_country_code 映射到国家代码（如 CN）
function getCountryCodeFromOrder(order: Order): string {
  const rawOrder = order as any

  // 优先使用后端直接返回的国家代码
  if (rawOrder.hzkj_country_code) {
    return String(rawOrder.hzkj_country_code).toUpperCase()
  }

  const countryId = rawOrder.hzkj_country_id
  if (countryId != null && countryId !== '') {
    const idStr = String(countryId)
    // 参考 settings/address-form 中的约定：1000001 对应中国 CN
    if (idStr === '1000001') {
      return 'CN'
    }
  }

  // 如果 Order 本身的 country 字段是代码，也可以作为兜底
  if (order.country && order.country.length === 2) {
    return order.country.toUpperCase()
  }

  return ''
}

// 从订单中获取客户名称（优先使用多语言字段）
function getCustomerNameFromOrder(order: Order): string {
  const raw = (order as any).hzkj_customer_name
  if (raw && typeof raw === 'object') {
    return (
      raw.GLang ||
      raw.zh_CN ||
      raw.zh_TW ||
      order.customerName ||
      ''
    )
  }
  return order.customerName || ''
}

export function OrdersEditAddressDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: OrdersEditAddressDialogProps) {
  if (!order) return null

  const rawOrder = order as any

  const initialData = {
    // Name: 来自后端 first / last name 字段，如果没有再回退到 hzkj_customer_name
    customerName: getCustomerNameFromOrder(order),
    firstName: rawOrder.hzkj_customer_first_name || '',
    lastName: rawOrder.hzkj_customer_last_name || '',
    // Address 映射到 hzkj_address1
    address: rawOrder.hzkj_address1 || order.address || '',
    // Address2 映射到 hzkj_address2
    address2: rawOrder.hzkj_address2 || '',
    // City 映射到 hzkj_city
    city: rawOrder.hzkj_city || order.city || '',
    // Province：使用 hzkj_admindivision_id 作为选中值，具体名称由下拉选项提供
    province: rawOrder.hzkj_admindivision_id
      ? String(rawOrder.hzkj_admindivision_id)
      : order.province || '',
    // Country：通过 hzkj_country_id / hzkj_country_code 映射到 Select 使用的国家代码
    country: getCountryCodeFromOrder(order),
    // Postcode 仍然使用已有字段
    postalCode: order.postalCode,
    // Phone 映射到 hzkj_phone
    phoneNumber: rawOrder.hzkj_phone || order.phoneNumber || '',
    // Email 映射到 hzkj_email
    email: rawOrder.hzkj_email || order.email || '',
    // Warehouse 映射到 hzkj_dst_warehouse_id（作为仓库 ID）
    shippingOrigin: rawOrder.hzkj_dst_warehouse_id
      ? String(rawOrder.hzkj_dst_warehouse_id)
      : order.shippingOrigin || '',
    // 税号：直接映射后端 hzkj_tax_id
    taxId: rawOrder.hzkj_tax_id || '',
  }

  return (
    <EditAddressDialog
      open={open}
      onOpenChange={onOpenChange}
      initialData={initialData}
      onConfirm={onConfirm}
    />
  )
}
