import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  linkProduct,
  queryShopifyUnconnectedProducts,
  querySkuByCustomer,
  type ShopifyUnconnectedProductItem,
  type SkuRecordItem,
} from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { Link2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

/* ===================== types ===================== */

interface StoreProduct {
  id: string
  image: string
  description: string
  variantId: string
}

interface TeemDropProduct {
  id: string
  image: string
  name: string
  tdSku: string
}

interface ProductsConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (
    connections: Array<{ storeProductId: string; teemDropProductId: string }>
  ) => void
}

/* ===================== component ===================== */

export function ProductsConnectionDialog({
  open,
  onOpenChange,
  onConfirm,
}: ProductsConnectionDialogProps) {
  const { auth } = useAuthStore()

  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([])
  const [teemDropProducts, setTeemDropProducts] = useState<TeemDropProduct[]>([])
  const [isLoadingStoreProducts, setIsLoadingStoreProducts] = useState(false)
  const [isLoadingTeemDropProducts, setIsLoadingTeemDropProducts] =
    useState(false)

  const [selectedStoreProductId, setSelectedStoreProductId] = useState<string>(
    ''
  )

  const [connections, setConnections] = useState<
    Array<{ storeProductId: string; teemDropProductId: string }>
  >([])

  /* ---------- helpers ---------- */

  const getConnectedTeemDropId = (storeProductId: string) =>
    connections.find((c) => c.storeProductId === storeProductId)
      ?.teemDropProductId

  const isStoreConnected = (storeProductId: string) =>
    connections.some((c) => c.storeProductId === storeProductId)

  const isConnectedToSelected = (teemDropProductId: string) =>
    connections.some(
      (c) =>
        c.storeProductId === selectedStoreProductId &&
        c.teemDropProductId === teemDropProductId
    )


  const { sortedStoreProducts, sortedTeemDropProducts } = useMemo(() => {
    // 创建连接映射
    const storeToTeemDrop = new Map<string, string>()
    const teemDropToStore = new Map<string, string>()
    connections.forEach((conn) => {
      storeToTeemDrop.set(conn.storeProductId, conn.teemDropProductId)
      teemDropToStore.set(conn.teemDropProductId, conn.storeProductId)
    })

    // 记录已使用的产品
    const usedStoreIds = new Set<string>()
    const usedTeemDropIds = new Set<string>()

    // 获取下一个未使用的 Store Product（按原始顺序）
    let storeCursor = 0
    const getNextUnusedStore = (): StoreProduct | null => {
      while (
        storeCursor < storeProducts.length &&
        usedStoreIds.has(storeProducts[storeCursor].id)
      ) {
        storeCursor++
      }
      if (storeCursor >= storeProducts.length) return null
      const product = storeProducts[storeCursor]
      storeCursor++
      usedStoreIds.add(product.id)
      return product
    }

    // 获取下一个未使用的 TeemDrop Product（按原始顺序）
    let teemDropCursor = 0
    const getNextUnusedTeemDrop = (): TeemDropProduct | null => {
      while (
        teemDropCursor < teemDropProducts.length &&
        usedTeemDropIds.has(teemDropProducts[teemDropCursor].id)
      ) {
        teemDropCursor++
      }
      if (teemDropCursor >= teemDropProducts.length) return null
      const product = teemDropProducts[teemDropCursor]
      teemDropCursor++
      usedTeemDropIds.add(product.id)
      return product
    }

    const sortedStores: StoreProduct[] = []
    const sortedTeemDrops: TeemDropProduct[] = []

    // 最大长度：取两个列表的最大值
    const maxLength = Math.max(storeProducts.length, teemDropProducts.length)

    // 按位置对齐排序
    for (let i = 0; i < maxLength; i++) {
      // 尝试找到已连接的对
      let foundPair = false

      // 先检查未使用的 Store Product 是否有连接
      for (const store of storeProducts) {
        if (usedStoreIds.has(store.id)) continue

        const connectedTeemDropId = storeToTeemDrop.get(store.id)
        if (connectedTeemDropId && !usedTeemDropIds.has(connectedTeemDropId)) {
          const teemDrop = teemDropProducts.find((p) => p.id === connectedTeemDropId)
          if (teemDrop) {
            sortedStores.push(store)
            sortedTeemDrops.push(teemDrop)
            usedStoreIds.add(store.id)
            usedTeemDropIds.add(teemDrop.id)
            foundPair = true
            break
          }
        }
      }

      // 如果没有找到已连接的对，则按原始顺序填充
      if (!foundPair) {
        const nextStore = getNextUnusedStore()
        const nextTeemDrop = getNextUnusedTeemDrop()

        if (nextStore) sortedStores.push(nextStore)
        if (nextTeemDrop) sortedTeemDrops.push(nextTeemDrop)
      }
    }

    // 追加剩余未使用的产品
    storeProducts.forEach((product) => {
      if (!usedStoreIds.has(product.id)) {
        sortedStores.push(product)
      }
    })

    teemDropProducts.forEach((product) => {
      if (!usedTeemDropIds.has(product.id)) {
        sortedTeemDrops.push(product)
      }
    })

    return {
      sortedStoreProducts: sortedStores,
      sortedTeemDropProducts: sortedTeemDrops,
    }
  }, [connections, storeProducts, teemDropProducts])

  /* ---------- fetch data from API ---------- */

  useEffect(() => {
    if (!open) return

    const customerId = auth.user?.customerId
    const accountId = auth.user?.id

    
    const SHOP_ID = '0'

    const fetchStoreProducts = async () => {
      setIsLoadingStoreProducts(true)
      try {
        const result = await queryShopifyUnconnectedProducts({
          shopId: SHOP_ID,
          customerId: String(customerId),
          accountId: String(accountId),
          pageIndex: 0,
          pageSize: 100,
        })

        const formatted: StoreProduct[] = result.rows.map(
          (item: ShopifyUnconnectedProductItem & { [key: string]: unknown }) => {
            const productId = item.productId as string | number | undefined
            const spuImg = item.spuImg as string | undefined
            const spuTitle = item.spuTitle as string | undefined

            const id =
              typeof productId === 'string'
                ? productId
                : productId != null
                  ? String(productId)
                  : ''

            return {
              id,
              image: typeof spuImg === 'string' ? spuImg : '',
              description: typeof spuTitle === 'string' ? spuTitle : id,
              variantId: id,
            }
          }
        )

        setStoreProducts(formatted)

        if (!selectedStoreProductId && formatted.length > 0) {
          setSelectedStoreProductId(formatted[0].id)
        }
      } catch (error) {
        console.error('Failed to load store products in dialog:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load store products. Please try again.'
        )
        setStoreProducts([])
      } finally {
        setIsLoadingStoreProducts(false)
      }
    }

    const fetchTeemDropProducts = async () => {
      setIsLoadingTeemDropProducts(true)
      try {
        const result = await querySkuByCustomer(
          undefined,
          '0',
          '0',
          1,
          100
        )

        const rows = Array.isArray(result) ? result : (result as {
          rows: SkuRecordItem[]
        }).rows

        const formatted: TeemDropProduct[] = (rows || []).map(
          (item: SkuRecordItem & { [key: string]: unknown }) => {
            const id = item.id || item.hzkj_sku_number || ''
            const image = (item as any).hzkj_picturefield as string | undefined
            return {
              id,
              image: typeof image === 'string' ? image : '',
              name:
                typeof (item as any).name === 'string'
                  ? ((item as any).name as string)
                  : item.hzkj_sku_name || id,
              tdSku: item.hzkj_sku_number || '',
            }
          }
        )

        setTeemDropProducts(formatted)
      } catch (error) {
        console.error('Failed to load TeemDrop products in dialog:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load TeemDrop products. Please try again.'
        )
        setTeemDropProducts([])
      } finally {
        setIsLoadingTeemDropProducts(false)
      }
    }

    void fetchStoreProducts()
    void fetchTeemDropProducts()
  }, [open, auth.user?.customerId, auth.user?.id, selectedStoreProductId])

  /* ---------- core logic ---------- */

  const handleConnect = (teemDropProductId: string) => {
    if (!selectedStoreProductId) return

    setConnections((prev) => {
      // 1. 移除当前左侧 variant 的旧连接
      const withoutStore = prev.filter(
        (c) => c.storeProductId !== selectedStoreProductId
      )

      // 2. 保证 TD SKU 只能被连接一次
      const withoutTeemDrop = withoutStore.filter(
        (c) => c.teemDropProductId !== teemDropProductId
      )

      return [
        ...withoutTeemDrop,
        {
          storeProductId: selectedStoreProductId,
          teemDropProductId,
        },
      ]
    })
  }

  const handleConfirm = () => {
    const customerId = auth.user?.customerId

    if (!customerId) {
      toast.error('Missing customerId, please re-login.')
      return
    }

    if (connections.length === 0) {
      toast.error('Please connect at least one product.')
      return
    }

    void (async () => {
      try {
        await Promise.all(
          connections.map((conn) =>
            linkProduct({
              customerId: String(customerId),
              // 修正：左边为 shopSkuId，右边为 localSkuId
              shopSkuId: conn.storeProductId,
              localSkuId: conn.teemDropProductId,
            })
          )
        )

        toast.success('Products linked successfully.')
        onConfirm(connections)
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to link products:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to link products. Please try again.'
        )
      }
    })()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] !max-w-[70vw] flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='text-center'>Products Connection</DialogTitle>
          <p className='text-muted-foreground mt-2 text-center text-sm'>
            Ensure the store's product status is set to 'Active Listing'.
          </p>
        </DialogHeader>

        <div className='flex min-h-0 flex-1 gap-6 overflow-hidden'>
          {/* ================= 左侧 ================= */}
          <div className='flex flex-1 flex-col overflow-hidden'>
            <h3 className='mb-4 text-sm font-semibold'>Store Products</h3>
            <div className='flex-1 space-y-3 overflow-y-auto'>
              {isLoadingStoreProducts ? (
                <div className='text-muted-foreground py-4 text-center text-sm'>
                  Loading...
                </div>
              ) : sortedStoreProducts.length === 0 ? (
                <div className='text-muted-foreground py-4 text-center text-sm'>
                  No products
                </div>
              ) : (
                sortedStoreProducts.map((product, index) => {
                const selected = selectedStoreProductId === product.id
                const connected = isStoreConnected(product.id)
                const teemDropProductAtSameIndex = sortedTeemDropProducts[index]
                const isConnectedToSameIndex =
                  teemDropProductAtSameIndex &&
                  getConnectedTeemDropId(product.id) ===
                    teemDropProductAtSameIndex.id

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedStoreProductId(product.id)}
                      className={`cursor-pointer rounded-lg border p-3 transition ${selected || isConnectedToSameIndex ? 'border-primary bg-primary/5' : 'hover:border-primary/40'} `}
                    >
                      <div className='flex gap-3'>
                        <img
                          src={product.image}
                          className='h-14 w-14 rounded object-cover'
                        />
                        <div className='flex-1'>
                          <p className='text-sm'>{product.description}</p>
                          <p className='text-muted-foreground text-xs'>
                            Variant ID: {product.variantId}
                          </p>
                        </div>
                        {connected && (
                          <span className='text-primary text-xs'>Unbind</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ================= 中间 ================= */}
          <div className='flex w-12 flex-col items-center pt-10'>
            {sortedStoreProducts.map((p, index) => (
              <div key={p.id} className='flex h-[88px] items-center'>
                {getConnectedTeemDropId(p.id) &&
                sortedTeemDropProducts[index] &&
                getConnectedTeemDropId(p.id) ===
                  sortedTeemDropProducts[index].id ? (
                  <div className='flex w-12 items-center justify-center'>
                    <div className='flex items-center gap-1'>
                      <div className='h-px w-3 border-t border-dashed border-orange-500' />
                      <Link2 className='h-4 w-4 text-orange-500' />
                      <div className='h-px w-3 border-t border-dashed border-orange-500' />
                    </div>
                  </div>
                ) : (
                  <Link2 className='text-muted-foreground h-5 w-5 opacity-30' />
                )}
              </div>
            ))}
          </div>

          {/* ================= 右侧 ================= */}
          <div className='flex flex-1 flex-col overflow-hidden'>
            <h3 className='mb-4 text-sm font-semibold'>TeemDrop Products</h3>
            <div className='flex-1 space-y-3 overflow-y-auto'>
              {isLoadingTeemDropProducts ? (
                <div className='text-muted-foreground py-4 text-center text-sm'>
                  Loading...
                </div>
              ) : sortedTeemDropProducts.length === 0 ? (
                <div className='text-muted-foreground py-4 text-center text-sm'>
                  No products
                </div>
              ) : (
                sortedTeemDropProducts.map((product, index) => {
                const active = isConnectedToSelected(product.id)
                // 检查这个产品是否连接到对应位置的 Store Product
                const storeProductAtSameIndex = sortedStoreProducts[index]
                const isConnectedToSameIndex =
                  storeProductAtSameIndex &&
                  getConnectedTeemDropId(storeProductAtSameIndex.id) ===
                    product.id

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleConnect(product.id)}
                      className={`cursor-pointer rounded-lg border p-3 transition ${active || isConnectedToSameIndex ? 'border-primary bg-primary/5' : 'hover:border-primary/40'} `}
                    >
                      <div className='flex gap-3'>
                        <img
                          src={product.image}
                          className='h-14 w-14 rounded object-cover'
                        />
                        <div className='flex-1'>
                          <p className='text-sm'>{product.name}</p>
                          <p className='text-muted-foreground text-xs'>
                            SKU: {product.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
