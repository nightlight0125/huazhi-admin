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
import { Textarea } from '@/components/ui/textarea'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
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
import { type Quote } from '../data/schema'
import { qualities } from '../data/data'
import { ImageUpload } from './image-upload'

type QuotesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Quote
}

const formSchema = z.object({
  productName: z.string().min(1, '产品名称不能为空'),
  productUrl: z.string().optional(),
  images: z.array(z.string()).min(1, '至少需要上传一张产品图片'),
  budget: z.number().min(0, '预算不能为负数').optional(),
  quality: z.string().min(1, '请选择质量等级'),
  acceptSimilar: z.boolean(),
  description: z.string().optional(),
  notes: z.string().optional(),
})
type QuoteForm = z.infer<typeof formSchema>

export function QuotesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: QuotesMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<QuoteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      productName: '',
      productUrl: '',
      images: [],
      budget: undefined,
      quality: '',
      acceptSimilar: false,
      description: '',
      notes: '',
    },
  })

  const onSubmit = (data: QuoteForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data, isUpdate ? '询价已更新:' : '询价已创建:')
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
          <SheetTitle>{isUpdate ? '编辑询价' : '新增询价'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? '修改询价信息，所有字段都是可选的。'
              : '填写产品信息以创建新的询价请求。'}
            点击保存完成操作。
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='quotes-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 产品图片 */}
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品图片 *</FormLabel>
                  <FormControl>
                    <ImageUpload
                      images={field.value}
                      onChange={field.onChange}
                      maxImages={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 产品名称 */}
            <FormField
              control={form.control}
              name='productName'
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

            {/* 产品URL */}
            <FormField
              control={form.control}
              name='productUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='https://example.com/product' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 预算 */}
            <FormField
              control={form.control}
              name='budget'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预算 ($)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='请输入预算金额'
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 目标质量 */}
            <FormField
              control={form.control}
              name='quality'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目标质量</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择质量等级'
                    items={qualities.map(q => ({ label: q.label, value: q.value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 接受类似产品 */}
            <FormField
              control={form.control}
              name='acceptSimilar'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      接受类似产品
                    </FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      是否接受供应商推荐类似的产品
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 说明 */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>说明</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='请输入产品详细说明'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 备注 */}
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='请输入备注信息'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
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
          <Button form='quotes-form' type='submit'>
            保存更改
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
