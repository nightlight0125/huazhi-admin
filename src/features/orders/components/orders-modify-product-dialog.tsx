import { useEffect, useState } from 'react'
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { updateSalOutOrder } from '@/lib/api/orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type OrderProduct } from '../data/schema'
import { OrdersAddProductDialog } from './orders-add-product-dialog'

interface OrdersModifyProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: OrderProduct[]
  onConfirm: (products: OrderProduct[]) => void
  orderId?: string
  order?: any // 订单对象
  onSuccess?: () => void // 成功回调
}

interface EditableProduct extends OrderProduct {
  isEditing?: boolean
  tempSku?: string
  tempQuantity?: number
}

// Generate fake products if none provided
const generateFakeProducts = (): OrderProduct[] => {
  return [
    {
      id: 'CJWY159909801AZ',
      productName: "Men's Plush Hoodie",
      productVariant: [
        { id: '1', name: '颜色', value: '绿色' },
        { id: '2', name: '尺寸', value: 'L' },
      ],
      quantity: 1,
      productImageUrl:
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
      productLink: 'https://example.com/product1',
      price: 6.32,
      totalPrice: 6.32,
    },
    {
      id: 'CJWY159909802BZ',
      productName: "Women's Casual T-Shirt",
      productVariant: [
        { id: '3', name: '颜色', value: '白色' },
        { id: '4', name: '尺寸', value: 'M' },
      ],
      quantity: 2,
      productImageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
      productLink: 'https://example.com/product2',
      price: 12.5,
      totalPrice: 25.0,
    },
    {
      id: 'CJWY159909803CZ',
      productName: "Kids' Summer Shorts",
      productVariant: [
        { id: '5', name: '颜色', value: '蓝色' },
        { id: '6', name: '尺寸', value: 'S' },
      ],
      quantity: 3,
      productImageUrl:
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&h=200&fit=crop',
      productLink: 'https://example.com/product3',
      price: 8.99,
      totalPrice: 26.97,
    },
  ]
}

export function OrdersModifyProductDialog({
  open,
  onOpenChange,
  products: initialProducts,
  onConfirm,
  orderId,
  order,
  onSuccess,
}: OrdersModifyProductDialogProps) {
  const { auth } = useAuthStore()
  // Use fake products if no products provided

  const productsToUse =
    initialProducts.length > 0 ? initialProducts : generateFakeProducts()

  const [products, setProducts] = useState<EditableProduct[]>(
    productsToUse.map((p) => ({ ...p, isEditing: false }))
  )

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset products when dialog opens/closes
  useEffect(() => {
    if (open) {
      const productsToUse =
        initialProducts.length > 0 ? initialProducts : generateFakeProducts()
      setProducts(productsToUse.map((p) => ({ ...p, isEditing: false })))
      setEditingIndex(null)
    }
  }, [open, initialProducts])

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setProducts(
      products.map((p, i) => {
        if (i !== index) return p

        // 初始编辑值来源：优先使用后端字段，其次使用原有字段
        const initialSku = p.hzkj_shop_sku || p.id || ''
        const qtyFromSrc = p.hzkj_src_qty != null && p.hzkj_src_qty !== '' ? parseInt(String(p.hzkj_src_qty)) : NaN
        const qtyFromQuantity = p.quantity != null && p.quantity > 0 ? p.quantity : NaN
        const qtyFromHzkj = (p as any).hzkj_qty != null ? parseInt(String((p as any).hzkj_qty)) : NaN
        const initialQty = !isNaN(qtyFromSrc) ? qtyFromSrc : (!isNaN(qtyFromQuantity) ? qtyFromQuantity : (!isNaN(qtyFromHzkj) ? qtyFromHzkj : 1))

        return {
          ...p,
          isEditing: true,
          tempSku: initialSku,
          tempQuantity: initialQty,
        }
      })
    )
  }

  const handleSaveEdit = (index: number) => {
    const product = products[index]
    if (!product.tempSku || !product.tempQuantity || product.tempQuantity < 1) {
      return
    }

    setProducts(
      products.map((p, i) => {
        if (i === index) {
          const qty = product.tempQuantity!
          const priceNum =
            (p.hzkj_shop_price && parseFloat(String(p.hzkj_shop_price))) ||
            p.price ||
            0

          return {
            ...p,
            // 更新后端字段和本地字段
            hzkj_shop_sku: product.tempSku!,
            hzkj_src_qty: String(qty),
            quantity: qty,
            totalPrice: priceNum * qty,
            isEditing: false,
            tempSku: undefined,
            tempQuantity: undefined,
          }
        }
        return p
      })
    )
    setEditingIndex(null)
  }

  const handleCancelEdit = (index: number) => {
    setProducts(
      products.map((p, i) =>
        i === index
          ? {
              ...p,
              isEditing: false,
              tempSku: undefined,
              tempQuantity: undefined,
            }
          : p
      )
    )
    setEditingIndex(null)
  }

  const handleSkuChange = (index: number, value: string) => {
    setProducts(
      products.map((p, i) => (i === index ? { ...p, tempSku: value } : p))
    )
  }

  const handleQuantityChange = (index: number, value: number) => {
    const quantity = Math.max(1, value)
    setProducts(
      products.map((p, i) =>
        i === index ? { ...p, tempQuantity: quantity } : p
      )
    )
  }

  const handleAddProduct = () => {
    setAddProductDialogOpen(true)
  }

  const handleAddProductConfirm = (newProduct: OrderProduct) => {
    const editableProduct: EditableProduct = {
      ...newProduct,
      isEditing: false,
    }
    setProducts([...products, editableProduct])
  }

  const handleConfirm = async () => {
    const cleanedProducts = products.map(
      ({ isEditing, tempSku, tempQuantity, ...rest }) => rest
    )

    // 如果提供了 orderId 和 order，则调用 API
    if (orderId && order) {
      const customerId = auth.user?.customerId
      if (!customerId) {
        toast.error('Customer information is missing')
        return
      }

      const rawOrder = order as any

      // 获取原有的产品明细（从 order.lingItems）
      const existingDetailMap = new Map<string, any>()
      if (rawOrder.lingItems && Array.isArray(rawOrder.lingItems)) {
        rawOrder.lingItems.forEach((item: any) => {
          const entryId = String(item.entryId || '')
          if (entryId) {
            existingDetailMap.set(entryId, {
              entryId,
              skuId: String(
                item.hzkj_local_sku_id ||
                  item.hzkj_local_sku_id2 ||
                  item.hzkj_local_sku ||
                  ''
              ),
              quantity: Number(item.hzkj_qty || item.hzkj_src_qty || 0) || 0,
              flag: 0,
            })
          }
        })
      }

      // 处理界面上显示的产品（包括原有的和新增的）
      const updatedDetail: any[] = []
      cleanedProducts.forEach((product) => {
        const entryId = product.entryId || ''
        const skuId = String(
          product.hzkj_local_sku_id ||
            (product as any).hzkj_local_sku_id2 ||
            (product as any).hzkj_local_sku ||
            ''
        )

        if (!skuId) {
          return // 跳过没有 skuId 的产品
        }

        if (entryId) {
          // 这是原有的产品，更新它
          if (existingDetailMap.has(entryId)) {
            existingDetailMap.set(entryId, {
              entryId,
              skuId,
              quantity: product.quantity || 0,
              flag: 0,
            })
          } else {
            // 如果 entryId 存在但不在原有明细中，也添加
            updatedDetail.push({
              entryId,
              skuId,
              quantity: product.quantity || 0,
              flag: 0,
            })
          }
        } else {
          // 这是新增的产品
          updatedDetail.push({
            entryId: '', // 新增时为空
            skuId,
            quantity: product.quantity || 0,
            flag: 0,
          })
        }
      })

      // 合并原有的（已更新的）和新增的明细
      const detail = [
        ...Array.from(existingDetailMap.values()),
        ...updatedDetail,
      ]

      if (detail.length === 0) {
        toast.error('No valid products to update')
        return
      }

      // 获取订单地址信息
      const firstName =
        rawOrder.firstName ||
        (rawOrder.customerName &&
          typeof rawOrder.customerName === 'string' &&
          rawOrder.customerName.split(' ')[0]) ||
        (rawOrder.hzkj_customer_name &&
          typeof rawOrder.hzkj_customer_name === 'object' &&
          rawOrder.hzkj_customer_name.zh_CN) ||
        ''
      const lastName =
        rawOrder.lastName ||
        (rawOrder.customerName &&
          typeof rawOrder.customerName === 'string' &&
          rawOrder.customerName.split(' ').slice(1).join(' ')) ||
        ''

      setIsSubmitting(true)
      try {
        await updateSalOutOrder({
          orderId: orderId,
          customerId: String(customerId),
          firstName,
          lastName,
          phone:
            rawOrder.phone ||
            rawOrder.hzkj_telephone ||
            rawOrder.phoneNumber ||
            '',
          countryId: rawOrder.countryId || rawOrder.hzkj_country_id || '',
          admindivisionId: rawOrder.admindivisionId,
          city: rawOrder.city || rawOrder.hzkj_address?.split(',')[0] || '',
          address1:
            rawOrder.address1 ||
            rawOrder.address ||
            rawOrder.hzkj_address ||
            rawOrder.hzkj_bill_address ||
            '',
          address2: rawOrder.address2 || rawOrder.hzkj_sam_address || '',
          postCode:
            rawOrder.postCode ||
            rawOrder.postalCode ||
            rawOrder.hzkj_post_code ||
            '',
          taxId: rawOrder.taxId || '',
          customChannelId: rawOrder.customChannelId || '',
          email: rawOrder.email || rawOrder.hzkj_email || '',
          wareHouse:
            rawOrder.wareHouse ||
            rawOrder.warehouseId ||
            rawOrder.shippingOrigin ||
            '',
          detail,
        })

        toast.success('Products updated successfully')

        // 调用成功回调
        if (onSuccess) {
          onSuccess()
        }

        // 仍然调用 onConfirm 以保持向后兼容
        onConfirm(cleanedProducts)
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update products. Please try again.'
        )
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // 如果没有提供 orderId 和 order，保持原有行为
      onConfirm(cleanedProducts)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    const productsToUse =
      initialProducts.length > 0 ? initialProducts : generateFakeProducts()
    setProducts(productsToUse.map((p) => ({ ...p, isEditing: false })))
    setEditingIndex(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-y-auto'>
          <div className='flex justify-end'>
            <Button
              type='button'
              onClick={handleAddProduct}
              className='bg-orange-500 text-white hover:bg-orange-600'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add
            </Button>
          </div>
          {/* Products Table */}
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground text-center'
                    >
                      No products added
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, index) => {
                    const isEditing = editingIndex === index
                    const productId = product.id || `product-${index}`

                    return (
                      <TableRow key={productId}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.hzkj_picture ? (
                              <img
                                src={product.hzkj_picture}
                                className='h-12 w-12 rounded object-cover'
                              />
                            ) : (
                              <div className='bg-muted flex h-12 w-12 items-center justify-center rounded'>
                                <ImageIcon className='text-muted-foreground h-6 w-6' />
                              </div>
                            )}
                            <div className='flex flex-col'>
                              <Badge variant='secondary' className='mb-1 w-fit'>
                                {product?.hzkj_local_sku || '--'}
                              </Badge>
                              <span className='text-sm'>
                                {product.productName || '--'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={
                                product.tempSku ?? product.hzkj_shop_sku ?? ''
                              }
                              onChange={(e) =>
                                handleSkuChange(index, e.target.value)
                              }
                              className='h-8 w-40'
                            />
                          ) : (
                            <span className='text-sm'>
                              {product.hzkj_shop_sku || product.tempSku || '--'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type='number'
                              min={1}
                              value={(() => {
                                if (product.tempQuantity != null) return product.tempQuantity
                                if (product.hzkj_src_qty != null && product.hzkj_src_qty !== '') {
                                  const v = parseInt(String(product.hzkj_src_qty))
                                  return !isNaN(v) ? v : 1
                                }
                                if (product.quantity != null && product.quantity > 0) return product.quantity
                                const hzQty = (product as any).hzkj_qty
                                if (hzQty != null) {
                                  const v = parseInt(String(hzQty))
                                  return !isNaN(v) ? v : 1
                                }
                                return 1
                              })()}
                              onChange={(e) =>
                                handleQuantityChange(
                                  index,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className='h-8 w-20'
                            />
                          ) : (
                            <span className='text-sm'>
                              {product.hzkj_src_qty ?? product.quantity ?? product.hzkj_qty ?? '--'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>
                            {(() => {
                              const priceStr =
                                product.hzkj_shop_price ?? String(product.price)
                              const priceNum = parseFloat(priceStr)
                              const formatted = !isNaN(priceNum)
                                ? priceNum.toFixed(2)
                                : priceStr || '0.00'
                              return `$${formatted}`
                            })()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className='flex items-center gap-2'>
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='h-7 w-7 text-green-600 hover:text-green-700'
                                onClick={() => handleSaveEdit(index)}
                                disabled={
                                  !product.tempSku ||
                                  !product.tempQuantity ||
                                  product.tempQuantity < 1
                                }
                              >
                                <Check className='h-4 w-4' />
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='h-7 w-7 text-red-600 hover:text-red-700'
                                onClick={() => handleCancelEdit(index)}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 text-orange-500 hover:text-orange-600'
                              onClick={() => handleEdit(index)}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={isSubmitting}
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <OrdersAddProductDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
        onConfirm={handleAddProductConfirm}
        orderId={orderId}
        order={order}
        onSuccess={onSuccess}
      />
    </Dialog>
  )
}
