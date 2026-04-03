import { useEffect, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getCollectSKUsList } from '@/lib/api/products'
import { resolvePictureUrl } from '@/lib/resolve-picture-url'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type MyProductItem = Record<string, unknown>

interface SelectMyProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (products: MyProductItem[]) => void
}

export function SelectMyProductDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectMyProductDialogProps) {
  const { auth } = useAuthStore()
  const [nameOrCode, setNameOrCode] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<MyProductItem[]>([])
  const [products, setProducts] = useState<MyProductItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pageNo, setPageNo] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const customerId = auth.user?.customerId

  useEffect(() => {
    if (!open || !customerId) {
      if (!open) {
        setProducts([])
        setTotalCount(0)
      }
      return
    }
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const searchVal = appliedSearch.trim() || undefined
        const res = await getCollectSKUsList({
          customerId: String(customerId),
          pageNo,
          pageSize,
          ...(searchVal && { nameOrCode: searchVal }),
        })
        const data = res.data as Record<string, unknown> | undefined
        let rows: MyProductItem[] = []
        let count = 0
        if (data) {
          if (Array.isArray(data.data)) rows = data.data
          else if (Array.isArray(data.rows)) rows = data.rows
          else if (Array.isArray(data.list)) rows = data.list
          const tc =
            (typeof data.totalCount === 'number' ? data.totalCount : null) ??
            (typeof data.total === 'number' ? data.total : null) ??
            (typeof (res as Record<string, unknown>).totalCount === 'number'
              ? ((res as Record<string, unknown>).totalCount as number)
              : null)
          if (tc !== null) count = tc
        }
        setProducts(rows)
        setTotalCount(count)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load collected products.'
        )
        setProducts([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchData()
  }, [open, customerId, pageNo, pageSize, appliedSearch])

  const handleSearch = () => {
    setAppliedSearch(nameOrCode)
    setPageNo(1)
  }

  const handleConfirm = () => {
    if (selectedProducts.length > 0 && onSelect) {
      onSelect(selectedProducts)
      handleClose()
    }
  }

  const getItemKey = (item: MyProductItem) =>
    String(item.id ?? item.skuId ?? item.spuName ?? '')

  const toggleProduct = (item: MyProductItem) => {
    const key = getItemKey(item)
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => getItemKey(p) === key)
      if (exists) {
        return prev.filter((p) => getItemKey(p) !== key)
      }
      return [...prev, item]
    })
  }

  const handleClose = () => {
    setNameOrCode('')
    setAppliedSearch('')
    setSelectedProducts([])
    setProducts([])
    setTotalCount(0)
    setPageNo(1)
    onOpenChange(false)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageNumbers = getPageNumbers(pageNo, totalPages)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] w-[80vw] max-w-[80vw] flex-col sm:w-[80vw] sm:max-w-[80vw]'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>Select My Product</DialogTitle>
          </div>
        </DialogHeader>

        {/* Search and Filter Section */}
        <div className='border-border flex items-end gap-4 border-b pb-4'>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='name-or-code'>Product Name / SKU</Label>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                id='name-or-code'
                placeholder='Enter product name or code'
                value={nameOrCode}
                onChange={(e) => setNameOrCode(e.target.value)}
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
              className='bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Search
            </Button>
            <Button
              onClick={handleConfirm}
              className='bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
              disabled={selectedProducts.length === 0}
            >
              Confirm{' '}
              {selectedProducts.length > 0 && `(${selectedProducts.length})`}
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className='mt-4 flex-1 overflow-y-auto pr-2'>
          {!customerId ? (
            <div className='text-muted-foreground py-8 text-center'>
              Please login first
            </div>
          ) : isLoading && products.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
            </div>
          ) : products.length === 0 ? (
            <div className='text-muted-foreground py-12 text-center'>
              No collected products found
            </div>
          ) : (
            <div className='grid grid-cols-5 gap-4'>
              {products.map((item, idx) => {
                const key = getItemKey(item) || `idx-${idx}`
                const isSelected = selectedProducts.some(
                  (p) => getItemKey(p) === getItemKey(item)
                )
                return (
                  <div
                    key={key}
                    onClick={() => toggleProduct(item)}
                    className={cn(
                      'border-border bg-card relative cursor-pointer rounded-lg border p-3 transition-all',
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500 dark:border-orange-400 dark:ring-orange-400'
                        : 'hover:shadow-md'
                    )}
                  >
                    {isSelected && (
                      <div className='absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white dark:bg-orange-600'>
                        <Check className='h-3 w-3' strokeWidth={3} />
                      </div>
                    )}
                    <div className='border-border bg-muted relative mb-3 aspect-square overflow-hidden rounded border'>
                      {item.pic ? (
                        <img
                          src={resolvePictureUrl(item.pic)}
                          alt={String(item.spuName ?? '')}
                          className='h-full w-full object-contain'
                          referrerPolicy='no-referrer'
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src =
                              'data:image/svg+xml,' +
                              encodeURIComponent(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="55" fill="#999" font-size="12" text-anchor="middle">No Image</text></svg>'
                              )
                          }}
                        />
                      ) : (
                        <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                          No Image
                        </div>
                      )}
                    </div>
                    <div className='text-foreground line-clamp-2 max-h-[2.5rem] overflow-hidden text-xs leading-tight font-medium'>
                      {String(item.spuName ?? '')}
                    </div>

                    <div className='text-muted-foreground text-[14px]'>
                      {String(item.number ?? '')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {customerId && totalCount > 0 && (
          <div className='border-border border-t pt-4'>
            <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v))
                    setPageNo(1)
                  }}
                >
                  <SelectTrigger className='h-8 w-[70px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {[10, 20, 30, 50].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>每页条数</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm'>
                  第 {pageNo} / {totalPages} 页，共 {totalCount} 条
                </span>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 w-8 p-0'
                    disabled={pageNo <= 1}
                    onClick={() => setPageNo(1)}
                  >
                    <ChevronsLeft className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 w-8 p-0'
                    disabled={pageNo <= 1}
                    onClick={() => setPageNo((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  {pageNumbers.map((num, idx) =>
                    num === '...' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className='text-muted-foreground px-1 text-sm'
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={num}
                        variant={pageNo === num ? 'default' : 'outline'}
                        size='sm'
                        className='h-8 min-w-8 px-2'
                        onClick={() => setPageNo(num as number)}
                      >
                        {num}
                      </Button>
                    )
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 w-8 p-0'
                    disabled={pageNo >= totalPages}
                    onClick={() =>
                      setPageNo((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 w-8 p-0'
                    disabled={pageNo >= totalPages}
                    onClick={() => setPageNo(totalPages)}
                  >
                    <ChevronsRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
