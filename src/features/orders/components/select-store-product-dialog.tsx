import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 店铺产品类型
type StoreProduct = {
  id: string
  sku: string
  productName: string
  image: string
  dimensions: {
    length: string
    height: string
  }
  accessories: string[]
}

// Mock 数据
const mockProducts: StoreProduct[] = [
  {
    id: '1',
    sku: '3326 HZC73-M00',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '2',
    sku: '3326 HZC73-P18',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '3',
    sku: '3326 HZC73-N29',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '4',
    sku: '3326 HZC73-I35',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '5',
    sku: 'Quanzhi 713 HZC73-R36',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '6',
    sku: '3326 HZC73-M01',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '7',
    sku: '3326 HZC73-M02',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
  {
    id: '8',
    sku: '3326 HZC73-M03',
    productName: 'HY300 Home mini portable smart projector',
    image: '/placeholder-product.jpg',
    dimensions: { length: '138mm', height: '100.8mm' },
    accessories: ['Manual', 'Cable de energia', 'Control remoto'],
  },
]

interface SelectStoreProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (product: StoreProduct) => void
}

export function SelectStoreProductDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectStoreProductDialogProps) {
  const [skuId, setSkuId] = useState('')
  const [productName, setProductName] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null
  )
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)

  const handleSearch = () => {
    // 过滤产品
    const filtered = mockProducts.filter((product) => {
      const matchesSku =
        !skuId || product.sku.toLowerCase().includes(skuId.toLowerCase())
      const matchesName =
        !productName ||
        product.productName.toLowerCase().includes(productName.toLowerCase())
      return matchesSku && matchesName
    })
    setFilteredProducts(filtered)
  }

  const handleConfirm = () => {
    if (selectedProduct && onSelect) {
      onSelect(selectedProduct)
      handleClose()
    }
  }

  const handleClose = () => {
    setSkuId('')
    setProductName('')
    setSelectedProduct(null)
    setFilteredProducts(mockProducts)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] w-[80vw] max-w-[80vw] flex-col sm:w-[80vw] sm:max-w-[80vw]'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>Select Store Product</DialogTitle>
          </div>
        </DialogHeader>

        {/* Search and Filter Section */}
        <div className='flex items-end gap-4 border-b pb-4'>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='sku-id'>SKU ID</Label>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                id='sku-id'
                placeholder='Enter SKU ID'
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className='pl-9'
              />
            </div>
          </div>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='product-name'>Product Name</Label>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                id='product-name'
                placeholder='Enter Product Name'
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className='pl-9'
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleSearch}
              className='bg-orange-500 text-white hover:bg-orange-600'
            >
              Search
            </Button>
            <Button
              onClick={handleConfirm}
              className='bg-orange-500 text-white hover:bg-orange-600'
              disabled={!selectedProduct}
            >
              Confirm
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className='mt-4 flex-1 overflow-y-auto pr-2'>
          <div className='grid grid-cols-5 gap-4'>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`cursor-pointer rounded-lg border bg-white p-3 transition-all ${
                  selectedProduct?.id === product.id
                    ? 'border-orange-500 ring-2 ring-orange-500'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Product Image */}
                <div className='relative mb-3 aspect-square overflow-hidden rounded border border-gray-200 bg-gray-50'>
                  <div className='flex h-full w-full items-center justify-center p-2'>
                    {/* Placeholder for product image - white cylindrical projector */}
                    <div className='relative flex h-full w-full flex-col items-center justify-center'>
                      {/* Projector body */}
                      <div className='relative'>
                        <div className='h-20 w-14 rounded-t-lg border-2 border-gray-300 bg-white shadow-sm'></div>
                        {/* Stand */}
                        <div className='mx-auto mt-1 h-2 w-8 rounded bg-gray-400'></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Description Below Image */}
                <div className='space-y-2'>
                  {/* Dimensions */}
                  <div className='text-[9px] font-medium text-gray-600'>
                    {product.dimensions.length} × {product.dimensions.height}
                  </div>

                  {/* Product Name */}
                  <div className='line-clamp-2 min-h-[2.5rem] text-xs leading-tight font-medium text-gray-900'>
                    {product.productName}
                  </div>

                  {/* SKU */}
                  <div className='font-mono text-[10px] text-gray-600'>
                    {product.sku}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
