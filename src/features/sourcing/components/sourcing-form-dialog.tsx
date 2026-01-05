import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  /** 标题，例如 "New Sourcing" / "Edit Sourcing" */
  title: string
  /** 提交按钮文案，例如 "Submit" / "Save" */
  submitLabel: string
  /** 是否必须上传图片（新建时 true，编辑时可为 false） */
  requireImage?: boolean
  /** 初始值（编辑时传入） */
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
    productLink: string
    price?: string
    remark?: string
    productImage?: string
  }) => void
}

export function SourcingFormDialog({
  open,
  onOpenChange,
  title,
  submitLabel,
  requireImage = false,
  initialValues,
  onSubmit,
}: SourcingFormDialogProps) {
  const formSchema = useMemo(() => {
    let base = z.object({
      productName: z.string().min(1, 'Product name is required'),
      productLink: z
        .string()
        .min(1, 'Product link is required')
        .url('Please enter a valid URL'),
      // Price stored as string for easier input handling
      price: z
        .string()
        .optional()
        .refine(
          (val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
          { message: 'Price must be a valid number' }
        ),
      productImage: z.string().url('Please enter a valid image URL').optional(),
      remark: z
        .string()
        .max(250, 'Remark must be less than 250 characters')
        .optional(),
    })

    if (requireImage) {
      base = base.refine(
        (data) => data.productImage !== undefined && data.productImage !== '',
        {
          message: 'Product image URL is required',
          path: ['productImage'],
        }
      ) as typeof base
    }

    return base
  }, [requireImage])

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: initialValues?.productName ?? '',
      productLink: initialValues?.productLink ?? '',
      price: initialValues?.price ?? '',
      remark: initialValues?.remark ?? '',
      productImage: initialValues?.imageUrl ?? '',
    },
  })

  // 当初始值变化时重置表单
  useEffect(() => {
    form.reset({
      productName: initialValues?.productName ?? '',
      productLink: initialValues?.productLink ?? '',
      price: initialValues?.price ?? '',
      remark: initialValues?.remark ?? '',
      productImage: initialValues?.imageUrl ?? '',
    })
  }, [initialValues, form])

  const remarkValue = form.watch('remark') || ''
  const remarkLength = remarkValue.length

  const internalSubmit = (values: FormValues) => {
    onSubmit({
      productName: values.productName,
      productLink: values.productLink,
      price: values.price,
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
      <DialogContent className='sm:max-w-lg'>
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
                <FormItem>
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

            {/* Product Link */}
            <FormField
              control={form.control}
              name='productLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className='text-red-500'>*</span> Product Link
                  </FormLabel>
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

            {/* Product Price */}
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Please enter your product price...'
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
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
                <FormItem>
                  <FormLabel>
                    {requireImage && <span className='text-red-500'>*</span>}{' '}
                    Product Image URL
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Please enter image URL...' {...field} />
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
                <FormItem>
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
