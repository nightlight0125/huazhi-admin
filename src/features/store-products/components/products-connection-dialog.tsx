import { useMemo, useState } from 'react'
import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

/* ===================== mock data ===================== */

const mockStoreProducts: StoreProduct[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '【12+256GB】/ 墨韵黑',
    variantId: '43944754184307',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '【16+512GB】/ 墨韵黑',
    variantId: '43944754479219',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '【16+256GB】/ 羽衣白',
    variantId: '43944754413683',
  },
  {
    id: '4',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '【12+256GB】/ 琉光金',
    variantId: '43944754249843',
  },
]

const mockTeemDropProducts: TeemDropProduct[] = [
  {
    id: 'a',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Nylon Alpine Loop Strap – Orange 38/40/41mm',
    tdSku: 'SU00055993-Orange-38mm 40mm 41mm',
  },
  {
    id: 'b',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Nylon Alpine Loop Strap – Orange 42/44/45/49mm',
    tdSku: 'SU00055993-Orange-42mm 44mm 45mm 49mm',
  },
  {
    id: 'c',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    name: 'Nylon Alpine Loop Strap – Black 38/40/41mm',
    tdSku: 'SU00055993-Black-38mm 40mm 41mm',
  },
]

/* ===================== component ===================== */

export function ProductsConnectionDialog({
  open,
  onOpenChange,
  onConfirm,
}: ProductsConnectionDialogProps) {
  const [selectedStoreProductId, setSelectedStoreProductId] = useState<string>(
    mockStoreProducts[0].id
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

  /* ---------- sorted Store Products and TeemDrop Products ---------- */

  // 统一的排序逻辑：根据连接关系，使得左侧第 i 个 Store Product 和右侧第 i 个 TeemDrop Product 尽量对齐
  // 如果它们已连接，则显示在相同位置；如果未连接，则按原始顺序填充
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
        storeCursor < mockStoreProducts.length &&
        usedStoreIds.has(mockStoreProducts[storeCursor].id)
      ) {
        storeCursor++
      }
      if (storeCursor >= mockStoreProducts.length) return null
      const product = mockStoreProducts[storeCursor]
      storeCursor++
      usedStoreIds.add(product.id)
      return product
    }

    // 获取下一个未使用的 TeemDrop Product（按原始顺序）
    let teemDropCursor = 0
    const getNextUnusedTeemDrop = (): TeemDropProduct | null => {
      while (
        teemDropCursor < mockTeemDropProducts.length &&
        usedTeemDropIds.has(mockTeemDropProducts[teemDropCursor].id)
      ) {
        teemDropCursor++
      }
      if (teemDropCursor >= mockTeemDropProducts.length) return null
      const product = mockTeemDropProducts[teemDropCursor]
      teemDropCursor++
      usedTeemDropIds.add(product.id)
      return product
    }

    const sortedStores: StoreProduct[] = []
    const sortedTeemDrops: TeemDropProduct[] = []

    // 最大长度：取两个列表的最大值
    const maxLength = Math.max(
      mockStoreProducts.length,
      mockTeemDropProducts.length
    )

    // 按位置对齐排序
    for (let i = 0; i < maxLength; i++) {
      // 尝试找到已连接的对
      let foundPair = false

      // 先检查未使用的 Store Product 是否有连接
      for (const store of mockStoreProducts) {
        if (usedStoreIds.has(store.id)) continue

        const connectedTeemDropId = storeToTeemDrop.get(store.id)
        if (connectedTeemDropId && !usedTeemDropIds.has(connectedTeemDropId)) {
          const teemDrop = mockTeemDropProducts.find(
            (p) => p.id === connectedTeemDropId
          )
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
    mockStoreProducts.forEach((product) => {
      if (!usedStoreIds.has(product.id)) {
        sortedStores.push(product)
      }
    })

    mockTeemDropProducts.forEach((product) => {
      if (!usedTeemDropIds.has(product.id)) {
        sortedTeemDrops.push(product)
      }
    })

    return {
      sortedStoreProducts: sortedStores,
      sortedTeemDropProducts: sortedTeemDrops,
    }
  }, [connections])

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
    onConfirm(connections)
    onOpenChange(false)
  }

  /* ===================== render ===================== */

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
              {sortedStoreProducts.map((product, index) => {
                const selected = selectedStoreProductId === product.id
                const connected = isStoreConnected(product.id)
                // 检查这个产品是否连接到对应位置的 TeemDrop Product
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
              })}
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
              {sortedTeemDropProducts.map((product, index) => {
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
                          SKU: {product.tdSku}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
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
