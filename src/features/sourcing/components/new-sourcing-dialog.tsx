import { useCallback, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
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

const formSchema = z
  .object({
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
    productImage: z
      .instanceof(File, { message: 'Product image is required' })
      .optional(),
    remark: z
      .string()
      .max(250, 'Remark must be less than 250 characters')
      .optional(),
  })
  .refine((data) => data.productImage !== undefined, {
    message: 'Product image is required',
    path: ['productImage'],
  })

type FormValues = z.infer<typeof formSchema>

type NewSourcingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewSourcingDialog({
  open,
  onOpenChange,
}: NewSourcingDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      productLink: '',
      price: '',
      remark: '',
    },
  })

  const remarkValue = form.watch('remark') || ''
  const remarkLength = remarkValue.length

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      if (file.type.startsWith('image/')) {
        form.setValue('productImage', file, { shouldValidate: true })
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            setImagePreview(result)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [form]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = () => {
    setImagePreview(null)
    form.setValue('productImage', undefined, { shouldValidate: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = (values: FormValues) => {
    console.log('Submit new sourcing:', values)
    // Handle form submission here
    form.reset()
    setImagePreview(null)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
      setImagePreview(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>New Sourcing</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id='new-sourcing-form'
            onSubmit={form.handleSubmit(onSubmit)}
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
              render={() => (
                <FormItem>
                  <FormLabel>
                    <span className='text-red-500'>*</span> Product Image
                  </FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      {imagePreview ? (
                        <div className='relative'>
                          <div className='rounded-lg border p-3'>
                            <img
                              src={imagePreview}
                              alt='Product preview'
                              className='h-32 w-full rounded object-cover'
                            />
                          </div>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute top-2 right-2 h-6 w-6'
                            onClick={removeImage}
                          >
                            <Plus className='h-4 w-4 rotate-45' />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                            'hover:border-primary/50'
                          )}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Plus className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                          <p className='text-muted-foreground text-sm'>
                            Upload
                          </p>
                          <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={(e) => handleFileSelect(e.target.files)}
                          />
                        </div>
                      )}
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

            {/* Tips */}
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
          <Button
            type='submit'
            form='new-sourcing-form'
            className='bg-purple-600 hover:bg-purple-700'
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
