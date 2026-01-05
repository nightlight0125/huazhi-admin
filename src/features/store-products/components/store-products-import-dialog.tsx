import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import type { ShopInfo } from '@/stores/shop-store'
import { getUserShop } from '@/lib/api/shop'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const formSchema = z.object({
  shops: z.array(z.string()).min(1, {
    message: 'Please select at least one shop',
  }),
})

type StoreProductsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoreProductsImportDialog({
  open,
  onOpenChange,
}: StoreProductsImportDialogProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [shops, setShops] = useState<ShopInfo[]>([])
  const [isLoadingShops, setIsLoadingShops] = useState(false)
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { shops: [] },
  })

  // 当弹框打开时，获取店铺列表
  useEffect(() => {
    const fetchShops = async () => {
      if (!open) return

      const userId = auth.user?.id
      if (!userId) {
        setIsLoadingShops(false)
        setShops([])
        return
      }

      setIsLoadingShops(true)
      try {
        const response = await getUserShop(userId)
        console.log('获取店铺 API 完整响应:', response)
        console.log('response.data:', response.data)
        console.log('response.data 类型:', typeof response.data)

        // 根据实际 API 响应结构处理数据
        let shopsData: ShopInfo[] = []
        if (response.errorCode === '0' && response.data) {
          const data = response.data as { data?: ShopInfo[] }
          shopsData = (data.data as ShopInfo[]) || []
        }

        // 尝试多种可能的数据结构

        console.log('最终解析的店铺列表:', shopsData)
        setShops(shopsData)
      } catch (error) {
        console.error('获取店铺列表失败:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load shops. Please try again.'
        )
        setShops([])
      } finally {
        setIsLoadingShops(false)
      }
    }

    fetchShops()
  }, [open, auth.user?.id])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // 选中的是店铺 id 数组
    console.log('选中的店铺 IDs:', data.shops)
    // TODO: 在这里接入实际的导入逻辑（例如请求后端导入所选店铺）
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle>Import Store Products</DialogTitle>
          <DialogDescription>
            Import store products quickly from shop.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='store-products-import-form'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='shops'
              render={({ field }) => (
                <FormItem className='my-2'>
                  <FormLabel>shops</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          disabled={isLoadingShops}
                          className={cn(
                            'h-8 w-full justify-between font-normal',
                            !field.value || field.value.length === 0
                              ? 'text-muted-foreground'
                              : ''
                          )}
                        >
                          {isLoadingShops
                            ? 'Loading shops...'
                            : field.value && field.value.length > 0
                              ? `${field.value.length} shop(s) selected`
                              : 'Select shops...'}
                          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-[--radix-popover-trigger-width] p-0'
                      align='start'
                    >
                      <div className='max-h-[300px] overflow-y-auto p-1'>
                        {shops.length === 0 && !isLoadingShops ? (
                          <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                            No shops available
                          </div>
                        ) : (
                          shops
                            .map((shop, index) => {
                              // 使用 id 或索引作为唯一标识
                              const shopId = shop.id
                                ? String(shop.id)
                                : `shop-${index}`
                              const shopName =
                                shop.name ||
                                shop.platform ||
                                `Shop ${index + 1}`

                              // 如果 id 为空，跳过这个店铺
                              if (!shop.id && !shop.name && !shop.platform) {
                                return null
                              }

                              return (
                                <div
                                  key={shopId}
                                  className='hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5'
                                >
                                  <Checkbox
                                    checked={
                                      Array.isArray(field.value) &&
                                      field.value.includes(shopId)
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValue = Array.isArray(
                                        field.value
                                      )
                                        ? field.value
                                        : []
                                      if (checked) {
                                        field.onChange([
                                          ...currentValue,
                                          shopId,
                                        ])
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (id: string) => id !== shopId
                                          )
                                        )
                                      }
                                    }}
                                  />
                                  <label className='flex-1 cursor-pointer text-sm font-normal'>
                                    {shopName}
                                  </label>
                                </div>
                              )
                            })
                            .filter(Boolean)
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
          <Button type='submit' form='store-products-import-form'>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
