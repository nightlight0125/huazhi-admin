import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

// 模拟数据
const mockStoreProducts: StoreProduct[] = [
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
  {
    id: '6',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    description: '黑色 / XS / 纯棉',
    variantId: '43941683822707',
  },
]

const mockTeemDropProducts: TeemDropProduct[] = [
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

export function ProductsConnectionDialog({
  open,
  onOpenChange,
  onConfirm,
}: ProductsConnectionDialogProps) {
  const [selectedStoreProductId, setSelectedStoreProductId] = useState<
    string | null
  >(mockStoreProducts[0]?.id || null)
  const [connections, setConnections] = useState<
    Array<{ storeProductId: string; teemDropProductId: string }>
  >([
    {
      storeProductId: mockStoreProducts[0]?.id || '',
      teemDropProductId: mockTeemDropProducts[0]?.id || '',
    },
  ])

  const handleStoreProductSelect = (storeProductId: string) => {
    setSelectedStoreProductId(storeProductId)
  }

  const handleConnect = (teemDropProductId: string) => {
    if (!selectedStoreProductId) return

    const existingConnection = connections.find(
      (c) => c.storeProductId === selectedStoreProductId
    )

    if (existingConnection) {
      setConnections(
        connections.map((c) =>
          c.storeProductId === selectedStoreProductId
            ? { ...c, teemDropProductId }
            : c
        )
      )
    } else {
      setConnections([
        ...connections,
        { storeProductId: selectedStoreProductId, teemDropProductId },
      ])
    }
  }

  const handleDisconnect = (storeProductId: string) => {
    setConnections(
      connections.filter((c) => c.storeProductId !== storeProductId)
    )
  }

  const isConnected = (storeProductId: string, teemDropProductId: string) => {
    return connections.some(
      (c) =>
        c.storeProductId === storeProductId &&
        c.teemDropProductId === teemDropProductId
    )
  }

  const getConnectedTeemDropId = (storeProductId: string) => {
    return connections.find((c) => c.storeProductId === storeProductId)
      ?.teemDropProductId
  }

  const handleConfirm = () => {
    onConfirm(connections)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] w-full !max-w-[60vw] flex-col overflow-hidden sm:!max-w-[60vw]'>
        <DialogHeader className='relative'>
          <DialogTitle className='text-center'>Products Connection</DialogTitle>
          <p className='text-muted-foreground mt-2 text-center text-sm'>
            Ensure the store's product status is set to 'Active Listing'.
            Connection will fail if products are inactive, deleted, or archived.
          </p>
        </DialogHeader>

        <div className='flex min-h-0 flex-1 gap-6 overflow-hidden px-1'>
          {/* 左侧：Store Products */}
          <div className='flex-1 overflow-y-auto pr-6'>
            <h3 className='mb-4 text-sm font-semibold'>Store Products</h3>
            <div className='space-y-3'>
              {mockStoreProducts.map((product) => {
                const isSelected = selectedStoreProductId === product.id

                return (
                  <div
                    key={product.id}
                    className={`relative cursor-pointer rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleStoreProductSelect(product.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <img
                        src={product.image}
                        alt={product.description}
                        className='h-16 w-16 shrink-0 rounded object-cover'
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='mb-1 text-sm'>{product.description}</p>
                        <p className='text-muted-foreground text-xs'>
                          Variant ID: {product.variantId}
                        </p>
                      </div>
                      {isSelected && (
                        <span className='text-primary shrink-0 text-xs font-medium'>
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 中间：连接线 */}
          <div className='flex w-12 shrink-0 flex-col items-center justify-start py-4'>
            {mockStoreProducts.map((storeProduct) => {
              const connectedTeemDropId = getConnectedTeemDropId(
                storeProduct.id
              )
              const isActive = connectedTeemDropId !== undefined

              return (
                <div
                  key={storeProduct.id}
                  className='flex min-h-[80px] w-full items-center justify-center'
                >
                  {isActive ? (
                    <Link2 className='text-primary h-5 w-5' />
                  ) : (
                    <Link2 className='text-muted-foreground h-5 w-5 opacity-30' />
                  )}
                </div>
              )
            })}
          </div>

          {/* 右侧：TeemDrop Products */}
          <div className='flex-1 overflow-y-auto pl-6'>
            <h3 className='mb-4 text-sm font-semibold'>TeemDrop Products</h3>
            <div className='space-y-3'>
              {mockTeemDropProducts.map((product) => {
                const isConnectedToSelected =
                  selectedStoreProductId &&
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
                      <img
                        src={product.image}
                        alt={product.name}
                        className='h-16 w-16 shrink-0 rounded object-cover'
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='mb-1 text-sm'>{product.name}</p>
                        <p className='text-muted-foreground text-xs'>
                          TD SKU: {product.tdSku}
                        </p>
                      </div>
                      {selectedStoreProductId && (
                        <Button
                          variant={
                            isConnectedToSelected ? 'default' : 'outline'
                          }
                          size='sm'
                          className='h-7 shrink-0 text-xs'
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isConnectedToSelected) {
                              handleDisconnect(selectedStoreProductId)
                            } else {
                              handleConnect(product.id)
                            }
                          }}
                        >
                          {isConnectedToSelected ? 'Connected' : 'Connect'}
                        </Button>
                      )}
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
