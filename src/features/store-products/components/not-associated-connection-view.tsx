import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  getProductsList,
  queryShopifyUnconnectedProducts,
  type ApiProductItem,
  type ShopifyUnconnectedProductItem,
} from '@/lib/api/products'
import { getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

// HyperZone 列表：由 getProductsList 映射，字段与模板展示对齐
type TeemDropProductItem = {
  id?: string
  hzkj_picturefield?: string
  hzkj_good_hzkj_enname?: string
  number?: string
  [key: string]: unknown
}

function mapApiProductToTeemDropItem(p: ApiProductItem): TeemDropProductItem {
  return {
    id: p.id,
    number: p.number,
    hzkj_picturefield:
      typeof p.picture === 'string' ? p.picture : String(p.picture || ''),
    hzkj_good_hzkj_enname: p.enname || p.name || '',
  }
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

  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages]
  )

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
  const SHOP_ID = '0'

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
  const { searchKeyword } = useStoreProducts()
  // 用于传递给弹框的 ID
  const [dialogLeftProductId, setDialogLeftProductId] = useState<string>('')
  const [dialogRightProductId, setDialogRightProductId] = useState<string>('')

  const [teemDropProducts, setTeemDropProducts] = useState<
    TeemDropProductItem[]
  >([])
  const [totalTeemDropProducts, setTotalTeemDropProducts] = useState(0)
  const [isLoadingTeemDropProducts, setIsLoadingTeemDropProducts] =
    useState(false)

  const handleStoreProductSelect = (storeProductId: string) => {
    setSelectedStoreProductId(storeProductId)
    setTdPage(1)
  }

  const isConnected = (storeProductId: string, teemDropProductId: string) => {
    return connections.some(
      (c) =>
        c.storeProductId === storeProductId &&
        c.teemDropProductId === teemDropProductId
    )
  }

  useEffect(() => {
    const fetchStoreProducts = async () => {
      const customerId = auth.user?.customerId
      const accountId = auth.user?.id
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
        const formattedProducts: StoreProductItem[] = result.rows.map(
          (item: ShopifyUnconnectedProductItem) => ({
            id:
              typeof item.productId === 'string'
                ? item.productId
                : String(item.productId || ''),
            image:
              typeof item.spuImg === 'string'
                ? item.spuImg
                : String(item.spuImg || ''),
            description:
              typeof item.spuTitle === 'string'
                ? item.spuTitle
                : String(item.spuTitle || ''),
            variantId:
              typeof item.productId === 'string'
                ? item.productId
                : String(item.productId || ''),
          })
        )

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
  }, [
    storePage,
    storePageSize,
    storeSearchKeyword,
    auth.user?.customerId,
    auth.user?.id,
    auth.user?.accountNo,
  ])

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

  useEffect(() => {
    const fetchTeemDropProducts = async () => {
      const customerId = String(auth.user?.customerId ?? '')
      if (!customerId) {
        setTeemDropProducts([])
        setTotalTeemDropProducts(0)
        setIsLoadingTeemDropProducts(false)
        return
      }

      setIsLoadingTeemDropProducts(true)
      try {
        const response = await getProductsList({
          customerId,
          pageSize: tdPageSize,
          pageNo: tdPage,
          productName: searchKeyword?.trim() || '',
          deliveryId: '',
          categoryIds: [],
          productTypes: [],
          productTags: [],
        })

        const rows = response.data?.products ?? []
        setTeemDropProducts(rows.map(mapApiProductToTeemDropItem))
        setTotalTeemDropProducts(response.data?.totalCount ?? 0)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load HyperZone products. Please try again.'
        )
        setTeemDropProducts([])
        setTotalTeemDropProducts(0)
      } finally {
        setIsLoadingTeemDropProducts(false)
      }
    }

    void fetchTeemDropProducts()
  }, [tdPage, tdPageSize, searchKeyword, auth.user?.customerId])

  useEffect(() => {
    if (searchKeyword) {
      setTdPage(1)
    }
  }, [searchKeyword])

  return (
    <>
      <div className='flex h-[calc(100vh-13rem)] min-h-[360px] w-full min-w-0 flex-1 gap-6 overflow-hidden px-1'>
        {/* 左侧：Store Products — 头部固定，列表滚动，分页贴底 */}
        <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pr-6'>
          <div className='mb-4 shrink-0'>
            <h3 className='mb-4 text-sm font-semibold'>Store Products</h3>
            <div className='flex h-10 items-center gap-2'>
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
          </div>
          <div className='bg-background min-h-0 flex-1 overflow-y-auto pr-1'>
            {isLoadingStoreProducts ? (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                Loading...
              </div>
            ) : storeProducts.length > 0 ? (
              <div className='space-y-3 pb-1'>
                {storeProducts.map((product) => {
                  const productId = (product as any).productId || product.id
                  const isSelected = selectedStoreProductId === productId

                  return (
                    <div
                      key={productId}
                      className={`relative flex h-[112px] cursor-pointer items-stretch rounded-lg border p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => handleStoreProductSelect(product.id)}
                    >
                      <div className='flex min-h-0 flex-1 items-start gap-3'>
                        <img
                          src={product.image}
                          alt={product.description}
                          className='h-16 w-16 shrink-0 rounded object-cover'
                        />
                        <div className='min-w-0 flex-1'>
                          <p className='mb-1 line-clamp-3 text-sm break-words'>
                            {product.description}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Product ID:{' '}
                            {typeof productId === 'string'
                              ? productId
                              : String(productId || '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-muted-foreground mt-4 text-center text-sm'>
                No products found
              </div>
            )}
          </div>

          {!isLoadingStoreProducts && totalStoreProducts > 0 ? (
            <div className='bg-background shrink-0 border-t pt-3'>
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
            </div>
          ) : null}
        </div>

        {/* 右侧：HyperZone — 同上 */}
        <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-6'>
          <div className='mb-4 shrink-0'>
            <h3 className='mb-4 text-sm font-semibold'>HyperZone Products</h3>
            <div className='flex h-10 items-center'>
              <StoreProductsPrimaryButtons />
            </div>
          </div>
          <div className='bg-background min-h-0 flex-1 overflow-y-auto pr-1'>
            {isLoadingTeemDropProducts ? (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                Loading...
              </div>
            ) : teemDropProducts.length > 0 ? (
              <div className='space-y-3 pb-1'>
                {teemDropProducts.map((product) => {
                  const isConnectedToSelected =
                    !!selectedStoreProductId &&
                    !!product.id &&
                    isConnected(selectedStoreProductId, product.id)
                  return (
                    <div
                      key={product.id}
                      className={`relative flex h-[112px] items-stretch rounded-lg border p-3 transition-colors ${
                        isConnectedToSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className='flex min-h-0 flex-1 items-start gap-3'>
                        {product.hzkj_picturefield ? (
                          <img
                            src={product.hzkj_picturefield}
                            className='h-16 w-16 shrink-0 rounded object-cover'
                          />
                        ) : (
                          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400'>
                            No Img
                          </div>
                        )}
                        <div className='min-w-0 flex-1'>
                          <p className='mb-1 line-clamp-3 text-sm break-words'>
                            {typeof product.hzkj_good_hzkj_enname === 'string'
                              ? product.hzkj_good_hzkj_enname
                              : String(product.hzkj_good_hzkj_enname || '')}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            SPU: {product.number}
                          </p>
                        </div>
                        {selectedStoreProductId && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 shrink-0 px-3 text-xs'
                            onClick={(e) => {
                              e.stopPropagation()
                              const selectedStoreProduct = storeProducts.find(
                                (p) => {
                                  const pId = (p as any).productId || p.id
                                  return pId === selectedStoreProductId
                                }
                              )
                              const leftProductId =
                                (selectedStoreProduct as any)?.productId ||
                                selectedStoreProduct?.id ||
                                selectedStoreProductId

                              const rightProductId = product.id || ''

                              setDialogLeftProductId(leftProductId)
                              setDialogRightProductId(rightProductId)

                              setConnectionDialogOpen(true)
                            }}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-muted-foreground mt-4 text-center text-sm'>
                No products found
              </div>
            )}
          </div>

          {!isLoadingTeemDropProducts && totalTeemDropProducts > 0 ? (
            <div className='bg-background shrink-0 border-t pt-3'>
              <PaginationControl
                page={tdPage}
                pageSize={tdPageSize}
                totalItems={totalTeemDropProducts}
                onPageChange={setTdPage}
                onPageSizeChange={(size) => {
                  setTdPageSize(size)
                  setTdPage(1)
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <ProductsConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        leftProductId={dialogLeftProductId}
        rightProductId={dialogRightProductId}
        onConfirm={(newConnections) => {
          // 更新连接状态
          setConnections(newConnections)
          // TODO: 接入实际连接逻辑
          // eslint-disable-next-line no-console
        }}
      />
    </>
  )
}

// 保留用于类型参考
void _mockStoreProducts
void _mockTeemDropProducts
