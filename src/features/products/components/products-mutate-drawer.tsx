import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Product } from '../data/schema'
import { categories, locations } from '../data/data'

type ProductsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Product
}

const formSchema = z.object({
  name: z.string().min(1, '产品名称不能为空'),
  image: z.string().url('请输入有效的图片URL'),
  shippingLocation: z.string().min(1, '请选择发货地'),
  price: z.number().min(0, '价格不能为负数'),
  sku: z.string().min(1, 'SKU不能为空'),
  category: z.string().min(1, '请选择类别'),
})
type ProductForm = z.infer<typeof formSchema>

export function ProductsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ProductsMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<ProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
      image: '',
      shippingLocation: '',
      price: 0,
      sku: '',
      category: '',
    },
  })

  const onSubmit = (data: ProductForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data, isUpdate ? '产品已更新:' : '产品已创建:')
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? '编辑产品' : '新增产品'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '修改产品信息，所有字段都是必填的。'
              : '填写产品信息以创建新的产品。'}
            点击保存完成操作。
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='products-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 产品名称 */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入产品名称' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 产品图片 */}
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品图片URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='https://example.com/image.jpg' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 发货地 */}
            <FormField
              control={form.control}
              name='shippingLocation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>发货地</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择发货地'
                    items={locations.map(l => ({ label: l.label, value: l.value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 价格 */}
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>价格 (¥)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='请输入价格'
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name='sku'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入SKU' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 类别 */}
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类别</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择类别'
                    items={categories.map(c => ({ label: c.label, value: c.value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='products-form' type='submit'>
            保存更改
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
