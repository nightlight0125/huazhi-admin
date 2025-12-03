import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
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
  files: z.array(z.string()).min(1, {
    message: 'Please select at least one file',
  }),
})

// 模拟文件选项
const fileOptions = [
  { id: 'file1', name: 'products.csv' },
  { id: 'file2', name: 'inventory.csv' },
  { id: 'file3', name: 'prices.csv' },
  { id: 'file4', name: 'variants.csv' },
]

type StoreProductsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoreProductsImportDialog({
  open,
  onOpenChange,
}: StoreProductsImportDialogProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { files: [] },
  })

  const onSubmit = (_data: z.infer<typeof formSchema>) => {
    // TODO: 在这里接入实际的导入逻辑（例如请求后端导入所选文件）
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
              name='files'
              render={({ field }) => (
                <FormItem className='my-2'>
                  <FormLabel>shops</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'h-8 w-full justify-between font-normal',
                            !field.value || field.value.length === 0
                              ? 'text-muted-foreground'
                              : ''
                          )}
                        >
                          {field.value && field.value.length > 0
                            ? `${field.value.length} file(s) selected`
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
                        {fileOptions.map((file) => (
                          <div
                            key={file.id}
                            className='hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5'
                          >
                            <Checkbox
                              checked={
                                Array.isArray(field.value) &&
                                field.value.includes(file.id)
                              }
                              onCheckedChange={(checked) => {
                                const currentValue = Array.isArray(field.value)
                                  ? field.value
                                  : []
                                if (checked) {
                                  field.onChange([...currentValue, file.id])
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (id: string) => id !== file.id
                                    )
                                  )
                                }
                              }}
                            />
                            <label className='flex-1 cursor-pointer text-sm font-normal'>
                              {file.name}
                            </label>
                          </div>
                        ))}
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
