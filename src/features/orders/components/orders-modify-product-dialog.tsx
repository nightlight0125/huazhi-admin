import { useEffect, useState } from 'react'
import { Check, Image as ImageIcon, Pencil, Plus, X } from 'lucide-react'
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
}: OrdersModifyProductDialogProps) {
  // Use fake products if no products provided
  const productsToUse =
    initialProducts.length > 0 ? initialProducts : generateFakeProducts()

  const [products, setProducts] = useState<EditableProduct[]>(
    productsToUse.map((p) => ({ ...p, isEditing: false }))
  )

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false)

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
      products.map((p, i) =>
        i === index
          ? { ...p, isEditing: true, tempSku: p.id, tempQuantity: p.quantity }
          : p
      )
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
          return {
            ...p,
            id: p.tempSku!,
            quantity: p.tempQuantity!,
            totalPrice: p.price * p.tempQuantity!,
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

  const handleConfirm = () => {
    // Remove isEditing, tempSku, tempQuantity properties before passing to parent
    const cleanedProducts = products.map(
      ({ isEditing, tempSku, tempQuantity, ...rest }) => rest
    )
    onConfirm(cleanedProducts)
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset to initial products
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

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.productImageUrl ? (
                              <img
                                src={product.productImageUrl}
                                alt={product.productName}
                                className='h-12 w-12 rounded object-cover'
                              />
                            ) : (
                              <div className='bg-muted flex h-12 w-12 items-center justify-center rounded'>
                                <ImageIcon className='text-muted-foreground h-6 w-6' />
                              </div>
                            )}
                            <div className='flex flex-col'>
                              <Badge variant='secondary' className='mb-1 w-fit'>
                                {product.id.substring(0, 2).toUpperCase()}
                              </Badge>
                              <span className='text-sm'>
                                {product.productName}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={product.tempSku || product.id}
                              onChange={(e) =>
                                handleSkuChange(index, e.target.value)
                              }
                              className='h-8 w-40'
                            />
                          ) : (
                            <span className='text-sm'>{product.id}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type='number'
                              min={1}
                              value={product.tempQuantity ?? product.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  index,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className='h-8 w-20'
                            />
                          ) : (
                            <span className='text-sm'>{product.quantity}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>
                            ${product.price.toFixed(2)}
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
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>

      <OrdersAddProductDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
        onConfirm={handleAddProductConfirm}
      />
    </Dialog>
  )
}
