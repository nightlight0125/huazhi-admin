import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type SourcingFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  requireImage?: boolean
  initialValues?: {
    productName?: string
    productLink?: string
    price?: string
    remark?: string
    imageUrl?: string | null
  }
  /** 表单提交 */
  onSubmit: (values: {
    productName: string
    productLink?: string
    price?: string
    remark?: string
    productImage?: string
  }) => void
}

const formSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productLink: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Please enter a valid URL',
    }),
  productImage: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        z.string().url().safeParse(val).success ||
        String(val).startsWith('data:image/'),
      {
        message: 'Please upload a valid image',
      }
    ),
  remark: z
    .string()
    .max(250, 'Remark must be less than 250 characters')
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function SourcingFormDialog({
  open,
  onOpenChange,
  title,
  submitLabel,
  requireImage = false,
  initialValues,
  onSubmit,
}: SourcingFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: initialValues?.productName ?? '',
      productLink: initialValues?.productLink ?? '',
      remark: initialValues?.remark ?? '',
      productImage: initialValues?.imageUrl ?? '',
    },
  })

  // 当初始值变化时重置表单
  useEffect(() => {
    form.reset({
      productName: initialValues?.productName ?? '',
      productLink: initialValues?.productLink ?? '',
      remark: initialValues?.remark ?? '',
      productImage: initialValues?.imageUrl ?? '',
    })
  }, [initialValues, form])

  const remarkValue = form.watch('remark') || ''
  const remarkLength = remarkValue.length
  const productImageValue = form.watch('productImage') || ''
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const internalSubmit = (values: FormValues) => {
    if (requireImage && !values.productImage) {
      form.setError('productImage', {
        type: 'manual',
        message: 'Product image URL is required',
      })
      return
    }
    onSubmit({
      productName: values.productName,
      productLink: values.productLink || undefined,
      remark: values.remark,
      productImage: values.productImage as string | undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id='sourcing-form'
            onSubmit={form.handleSubmit(internalSubmit)}
            className='space-y-4'
          >
            {/* Product Name */}
            <FormField
              control={form.control}
              name='productName'
              render={({ field }) => (
                <FormItem className='grid grid-cols-[140px_1fr] items-start gap-3'>
                  <FormLabel>
                    <span className='text-red-500'>*</span> Product Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Please enter your product name...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='productLink'
              render={({ field }) => (
                <FormItem className='grid grid-cols-[140px_1fr] items-start gap-3'>
                  <FormLabel>Product Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Please enter your product link...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Image */}
            <FormField
              control={form.control}
              name='productImage'
              render={({ field }) => (
                <FormItem className='grid grid-cols-[140px_1fr] items-start gap-3'>
                  <FormLabel>
                    {requireImage && <span className='text-red-500'>*</span>}{' '}
                    Product Image
                  </FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              field.onChange(reader.result)
                            }
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='border-border bg-muted/30 flex h-24 w-24 flex-col items-center justify-center rounded-md border text-sm'
                      >
                        {productImageValue ? (
                          <img
                            src={productImageValue}
                            alt='Uploaded product'
                            className='h-full w-full rounded-md object-cover'
                          />
                        ) : (
                          <>
                            <Plus className='mb-1 h-5 w-5' />
                            <span>Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remark */}
            <FormField
              control={form.control}
              name='remark'
              render={({ field }) => (
                <FormItem className='grid grid-cols-[140px_1fr] items-start gap-3'>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Textarea
                        placeholder='Please enter your remark...'
                        className='resize-none pr-16'
                        rows={4}
                        {...field}
                      />
                      <div className='text-muted-foreground absolute right-2 bottom-2 text-xs'>
                        {remarkLength}/250
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className='text-muted-foreground text-sm'>
              Tips: Sourcing result will be notified to you via email within 48
              hours.
            </p>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='submit' form='sourcing-form'>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
