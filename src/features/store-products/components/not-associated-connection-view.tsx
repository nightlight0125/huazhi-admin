import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  queryShopifyUnconnectedProducts,
  querySkuByCustomer,
  type ShopifyUnconnectedProductItem
} from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ProductsConnectionDialog } from './products-connection-dialog'
import { StoreProductsPrimaryButtons } from './store-products-primary-buttons'
import { useStoreProducts } from './store-products-provider'

// StoreProductItem 现在使用 API 返回的类型
type StoreProductItem = ShopifyUnconnectedProductItem & {
  id: string
  image: string
  description: string
  variantId: string
}

// TeemDropProductItem 基于 SKU 记录数据
type TeemDropProductItem = {
  id?: string
  hzkj_picturefield?: string
  name?: string
  number?: string
  [key: string]: unknown
}

// 保留 mockStoreProducts 用于类型参考（已不再使用，将被 API 数据替代）
const _mockStoreProducts: StoreProductItem[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '黑色 / 3XS / 涤纶',
    variantId: '43941683789939',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '黑色 / M / 化纤',
    variantId: '43941683953779',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '黄色 / L / 化纤',
    variantId: '43941684838515',
  },
  {
    id: '4',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '黑色 / M / 纯棉',
    variantId: '43941683921011',
  },
  {
    id: '5',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '白色 / L / 涤纶',
    variantId: '43941684478067',
  },
]

const _mockTeemDropProducts: TeemDropProductItem[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Drawing Board SetJumbo 30x40cm 5V USB App Remote',
    tdSku: 'SU00051688-Jumbo 30x40cm 5V USB App Remote',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Drawing Board SetMedium 20x20cm 5V USB App Remote',
    tdSku: 'SU00051688-Medium 20x20cm 5V USB App Remote',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Drawing Board SetExtra Large 35x25cm 5V USB App Remote',
    tdSku: 'SU00051688-Extra Large 35x25cm 5V USB App Remote',
  },
  {
    id: '4',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Drawing Board SetLarge 30x20cm 5V USB App Remote',
    tdSku: 'SU00051688-Large 30x20cm 5V USB App Remote',
  },
]

interface PaginationControlProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function PaginationControl({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationControlProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const pageNumbers = useMemo(() => {
    const numbers: (number | '...')[] = []
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i)
    }
    return numbers
  }, [totalPages])

  return (
    <div className='text-muted-foreground mt-4 flex items-center justify-between text-xs'>
      <div className='flex items-center gap-2'>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            const size = Number(value)
            onPageSizeChange(size)
            onPageChange(1)
          }}
        >
          <SelectTrigger className='h-7 w-[70px] text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side='top'>
            {[5, 10, 20].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>Rows per page</span>
      </div>

      <div className='flex items-center gap-3'>
        <span>
          Page {page} of {totalPages}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2'
            disabled={page === 1}
            onClick={() => onPageChange(1)}
          >
            «
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2'
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            ‹
          </Button>
          {pageNumbers.map((num, index) =>
            num === '...' ? (
              <span key={`dots-${index}`} className='px-1'>
                ...
              </span>
            ) : (
              <Button
                key={num}
                variant={page === num ? 'default' : 'outline'}
                size='sm'
                className={
                  page === num
                    ? 'h-7 min-w-7 bg-orange-500 px-2 text-white hover:bg-orange-600'
                    : 'h-7 min-w-7 px-2'
                }
                onClick={() => onPageChange(num)}
              >
                {num}
              </Button>
            )
          )}
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2'
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            ›
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2'
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            »
          </Button>
        </div>
      </div>
    </div>
  )
}

export function NotAssociatedConnectionView() {
  const { auth } = useAuthStore()
  // shopId 写死
  const SHOP_ID = '2337110780475925504'

  const [storeProducts, setStoreProducts] = useState<StoreProductItem[]>([])
  const [totalStoreProducts, setTotalStoreProducts] = useState(0)
  const [isLoadingStoreProducts, setIsLoadingStoreProducts] = useState(false)
  const [selectedStoreProductId, setSelectedStoreProductId] = useState<
    string | null
  >(null)

  const [connections, setConnections] = useState<
    Array<{ storeProductId: string; teemDropProductId: string }>
  >([])

  const [storePage, setStorePage] = useState(1)
  const [storePageSize, setStorePageSize] = useState(10)
  const [tdPage, setTdPage] = useState(1)
  const [tdPageSize, setTdPageSize] = useState(10)
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [storeSearchValue, setStoreSearchValue] = useState('') // Store Products 的搜索输入值
  const [storeSearchKeyword, setStoreSearchKeyword] = useState<string>('') // Store Products 实际用于搜索的关键词
  const { searchKeyword } = useStoreProducts() // 从 provider 获取 TeemDrop Products 的搜索关键词
  
  // TeemDrop Products 相关状态
  const [teemDropProducts, setTeemDropProducts] = useState<TeemDropProductItem[]>([])
  const [totalTeemDropProducts, setTotalTeemDropProducts] = useState(0)
  const [isLoadingTeemDropProducts, setIsLoadingTeemDropProducts] = useState(false)

  const handleStoreProductSelect = (storeProductId: string) => {
    setSelectedStoreProductId(storeProductId)
    // 选择 Store Product 时，重置 TeemDrop Products 到第一页
    setTdPage(1)
  }

  const isConnected = (storeProductId: string, teemDropProductId: string) => {
    return connections.some(
      (c) =>
        c.storeProductId === storeProductId &&
        c.teemDropProductId === teemDropProductId
    )
  }

  // 加载 Store Products
  useEffect(() => {
    const fetchStoreProducts = async () => {
      const customerId = auth.user?.customerId
      const accountId = auth.user?.id

      if (!customerId || !accountId) {
        console.warn('Missing customerId or accountId')
        return
      }

      setIsLoadingStoreProducts(true)
      try {
        const result = await queryShopifyUnconnectedProducts({
          shopId: SHOP_ID,
          customerId: String(customerId),
          accountId: String(accountId),
          pageIndex: storePage - 1,
          pageSize: storePageSize,
          hzkj_str: storeSearchKeyword.trim() || undefined, // 传递 Store Products 搜索关键词
        })

        // 转换 API 数据为组件需要的格式
        const formattedProducts: StoreProductItem[] = result.rows.map((item: ShopifyUnconnectedProductItem) => ({
          id: typeof item.productId === 'string' ? item.productId : String(item.productId || ''),
          image: typeof item.spuImg === 'string' ? item.spuImg : String(item.spuImg || ''),
          description: typeof item.spuTitle === 'string' ? item.spuTitle : String(item.spuTitle || ''),
          variantId: typeof item.productId === 'string' ? item.productId : String(item.productId || ''),
        }))

        setStoreProducts(formattedProducts)
        setTotalStoreProducts(result.totalCount)

        // 如果当前没有选中项且有数据，选中第一项
        if (!selectedStoreProductId && formattedProducts.length > 0) {
          setSelectedStoreProductId(formattedProducts[0].id)
        }
      } catch (error) {
        console.error('Failed to load store products:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load store products. Please try again.'
        )
        setStoreProducts([])
        setTotalStoreProducts(0)
      } finally {
        setIsLoadingStoreProducts(false)
      }
    }

    void fetchStoreProducts()
  }, [storePage, storePageSize, storeSearchKeyword, auth.user?.customerId, auth.user?.id, auth.user?.accountNo])
  
  // 当 Store Products 搜索关键词变化时，重置到第一页
  useEffect(() => {
    if (storeSearchKeyword) {
      setStorePage(1)
    }
  }, [storeSearchKeyword])
  
  // Store Products 搜索处理函数
  const handleStoreSearch = () => {
    setStoreSearchKeyword(storeSearchValue) // 设置搜索关键词，触发 useEffect 重新加载数据
    setStorePage(1) // 重置到第一页
  }

  // 加载 TeemDrop Products (SKU 记录)
  useEffect(() => {
    const fetchTeemDropProducts = async () => {
      // const customerId = auth.user?.customerId
      const customerId = '0'

      
      setIsLoadingTeemDropProducts(true)
      try {
        const result = await querySkuByCustomer(
          undefined, // goodId 不传，后端请求中不会包含 hzkj_good_id 字段
          Number(customerId),
          '0', // hzkj_public 默认 "0"
          tdPage,
          tdPageSize,
          true, // 返回总数
          searchKeyword // TeemDrop Products 的搜索关键词（来自 StoreProductsPrimaryButtons）
        )

        // 类型检查：确保返回的是带总数的对象
        if (!result || typeof result !== 'object' || !('rows' in result)) {
          throw new Error('Invalid API response format')
        }
        
        setTeemDropProducts(result.rows || [])
        setTotalTeemDropProducts(result.totalCount || 0)
      } catch (error) {
        console.error('Failed to load TeemDrop products:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load TeemDrop products. Please try again.'
        )
        setTeemDropProducts([])
        setTotalTeemDropProducts(0)
      } finally {
        setIsLoadingTeemDropProducts(false)
      }
    }

    void fetchTeemDropProducts()
  }, [tdPage, tdPageSize, searchKeyword, auth.user?.customerId])
  
  // 当 TeemDrop Products 搜索关键词变化时，重置到第一页
  useEffect(() => {
    if (searchKeyword) {
      setTdPage(1)
    }
  }, [searchKeyword])

  return (
    <>
      <div className='flex min-h-0 flex-1 gap-6 overflow-hidden px-1'>
        {/* 左侧：Store Products */}
        <div className='flex-1 overflow-y-auto pr-6'>
          <h3 className='mb-4 text-sm font-semibold'>Store Products</h3>
          <div className='mb-4 flex items-center gap-2'>
            <Input
              placeholder='enter store product\name\ID'
              value={storeSearchValue}
              onChange={(e) => setStoreSearchValue(e.target.value)}
              className='border-border focus-visible:ring-ring h-8 w-[280px] rounded-md focus-visible:ring-2'
            />
            <Button
              onClick={handleStoreSearch}
              className='h-8 rounded-md bg-orange-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2'
              size='sm'
            >
              <Search className='mr-2 h-4 w-4' />
              Search
            </Button>
          </div>
          <div className='space-y-3'>
            {
              storeProducts.length > 0 ? (
                storeProducts.map((product) => {
                  const isSelected = selectedStoreProductId === product.id

                  return (
                      <div key={product.id} className={`relative cursor-pointer rounded-lg border p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => handleStoreProductSelect(product.id)}>
                      <div className='flex items-start gap-3'>
                        <img src={product.image} alt={product.description} className='h-16 w-16 shrink-0 rounded object-cover' />
                        <div className='min-w-0 flex-1'>
                          <p className='mb-1 text-sm'>{product.description}</p>
                          <p className='text-muted-foreground text-xs'>
                            Variant ID: {product.variantId}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='mt-4 text-center text-sm text-muted-foreground'>
                  No products found
                </div>
              )
            }
          </div>

          {isLoadingStoreProducts ? (
            <div className='mt-4 text-center text-sm text-muted-foreground'>
              Loading...
            </div>
          ) : (
            totalStoreProducts > 0 ? (
            <PaginationControl
              page={storePage}
              pageSize={storePageSize}
              totalItems={totalStoreProducts}
              onPageChange={setStorePage}
              onPageSizeChange={(size) => {
                setStorePageSize(size)
                setStorePage(1) 
              }}
            />
          ) : null )}
        </div>

        {/* 右侧：TeemDrop Products */}
        <div className='flex-1 overflow-y-auto pl-6'>
          <h3 className='mb-4 text-sm font-semibold'>TeemDrop Products</h3>
          <div className='mb-4'>
            <StoreProductsPrimaryButtons />
          </div>
          <div className='space-y-3'>
            {isLoadingTeemDropProducts ? (
              <div className='mt-4 text-center text-sm text-muted-foreground'>
                Loading...
              </div>
            ) : teemDropProducts.length > 0 ? (
              teemDropProducts.map((product) => {
                const isConnectedToSelected =
                  !!selectedStoreProductId &&
                  !!product.id &&
                  isConnected(selectedStoreProductId, product.id)
                return (
                  <div
                    key={product.id}
                    className={`relative rounded-lg border p-3 transition-colors ${
                      isConnectedToSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      {product.hzkj_picturefield ? (
                        <img
                          src={product.hzkj_picturefield }
                          alt={product.name}
                          className='h-16 w-16 shrink-0 rounded object-cover'
                        />
                      ) : (
                        <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400'>
                          No Img
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <p className='mb-1 text-sm'>{product.name}</p>
                        <p className='text-muted-foreground text-xs'>
                          SPU: {product.number }
                        </p>
                      </div>
                      {selectedStoreProductId && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 shrink-0 px-3 text-xs'
                          onClick={() => setConnectionDialogOpen(true)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className='mt-4 text-center text-sm text-muted-foreground'>
                No products found
              </div>
            )}
          </div>

          {isLoadingTeemDropProducts ? null : totalTeemDropProducts > 0 ? (
            <PaginationControl
              page={tdPage}
              pageSize={tdPageSize}
              totalItems={totalTeemDropProducts}
              onPageChange={setTdPage}
              onPageSizeChange={(size) => {
                setTdPageSize(size)
                setTdPage(1) // 改变页面大小时重置到第一页
              }}
            />
          ) : null}
        </div>
      </div>

      <ProductsConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        onConfirm={(newConnections) => {
          // 更新连接状态
          setConnections(newConnections)
          // TODO: 接入实际连接逻辑
          // eslint-disable-next-line no-console
          console.log('Product connections:', newConnections)
        }}
      />
    </>
  )
}

// 保留用于类型参考
void _mockStoreProducts
void _mockTeemDropProducts
