import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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

interface StoreProductItem {
  id: string
  image: string
  description: string
  variantId: string
}

interface TeemDropProductItem {
  id: string
  image: string
  name: string
  tdSku: string
}

// TODO: 替换为真实接口数据
const mockStoreProducts: StoreProductItem[] = [
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

const mockTeemDropProducts: TeemDropProductItem[] = [
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

  const [storePage, setStorePage] = useState(1)
  const [storePageSize, setStorePageSize] = useState(5)
  const [tdPage, setTdPage] = useState(1)
  const [tdPageSize, setTdPageSize] = useState(5)
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleStoreProductSelect = (storeProductId: string) => {
    setSelectedStoreProductId(storeProductId)
  }

  // TODO: 这些函数将在后续功能中使用
  // const handleConnect = (teemDropProductId: string) => {
  //   if (!selectedStoreProductId) return
  //   const existingConnection = connections.find(
  //     (c) => c.storeProductId === selectedStoreProductId
  //   )
  //   if (existingConnection) {
  //     setConnections(
  //       connections.map((c) =>
  //         c.storeProductId === selectedStoreProductId
  //           ? { ...c, teemDropProductId }
  //           : c
  //       )
  //     )
  //   } else {
  //     setConnections([
  //       ...connections,
  //       { storeProductId: selectedStoreProductId, teemDropProductId },
  //     ])
  //   }
  // }

  // const handleDisconnect = (storeProductId: string) => {
  //   setConnections(
  //     connections.filter((c) => c.storeProductId !== storeProductId)
  //   )
  // }

  const isConnected = (storeProductId: string, teemDropProductId: string) => {
    return connections.some(
      (c) =>
        c.storeProductId === storeProductId &&
        c.teemDropProductId === teemDropProductId
    )
  }

  // 搜索过滤
  const filteredStoreProducts = useMemo(() => {
    if (!searchValue.trim()) {
      return mockStoreProducts
    }
    const searchLower = searchValue.toLowerCase().trim()
    return mockStoreProducts.filter((product) => {
      const descriptionMatch = product.description
        .toLowerCase()
        .includes(searchLower)
      const variantIdMatch = product.variantId
        .toLowerCase()
        .includes(searchLower)
      return descriptionMatch || variantIdMatch
    })
  }, [searchValue])

  const filteredTeemDropProducts = useMemo(() => {
    if (!searchValue.trim()) {
      return mockTeemDropProducts
    }
    const searchLower = searchValue.toLowerCase().trim()
    return mockTeemDropProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower)
      const skuMatch = product.tdSku.toLowerCase().includes(searchLower)
      return nameMatch || skuMatch
    })
  }, [searchValue])

  const pagedStoreProducts = filteredStoreProducts.slice(
    (storePage - 1) * storePageSize,
    storePage * storePageSize
  )

  const pagedTeemDropProducts = filteredTeemDropProducts.slice(
    (tdPage - 1) * tdPageSize,
    tdPage * tdPageSize
  )

  // 搜索时重置分页
  const handleSearch = () => {
    setStorePage(1)
    setTdPage(1)
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='enter store product\name\ID'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className='border-border focus-visible:ring-ring h-8 w-[280px] rounded-md focus-visible:ring-2'
          />
          <Button
            onClick={handleSearch}
            className='h-8 rounded-md bg-orange-500 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2'
            size='sm'
          >
            <Search className='mr-2 h-4 w-4' />
            Search
          </Button>
        </div>
        <StoreProductsPrimaryButtons />
      </div>
      <div className='flex min-h-0 flex-1 gap-6 overflow-hidden px-1'>
        {/* 左侧：Store Products */}
        <div className='flex-1 overflow-y-auto pr-6'>
          <h3 className='mb-4 text-sm font-semibold'>Store Products</h3>
          <div className='space-y-3'>
            {pagedStoreProducts.map((product) => {
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
                      <Button
                        variant='default'
                        size='sm'
                        className='h-7 shrink-0 px-3 text-xs'
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        Match
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <PaginationControl
            page={storePage}
            pageSize={storePageSize}
            totalItems={filteredStoreProducts.length}
            onPageChange={setStorePage}
            onPageSizeChange={setStorePageSize}
          />
        </div>

        {/* 右侧：TeemDrop Products */}
        <div className='flex-1 overflow-y-auto pl-6'>
          <h3 className='mb-4 text-sm font-semibold'>TeemDrop Products</h3>
          <div className='space-y-3'>
            {pagedTeemDropProducts.map((product) => {
              const isConnectedToSelected =
                !!selectedStoreProductId &&
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
                        SKU: {product.tdSku}
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
            })}
          </div>

          <PaginationControl
            page={tdPage}
            pageSize={tdPageSize}
            totalItems={filteredTeemDropProducts.length}
            onPageChange={setTdPage}
            onPageSizeChange={setTdPageSize}
          />
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
