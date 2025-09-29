import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, File, X } from 'lucide-react'
import { type BrandType } from '../data/schema'
import { brandTypeOptions, sizeOptions } from '../data/data'

const addBrandItemSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  size: z.enum(['large', 'medium', 'small']),
  file: z.any().refine((file) => file && file.length > 0, '请选择文件'),
  notes: z.string().optional(),
})

type AddBrandItemForm = z.infer<typeof addBrandItemSchema>

interface AddBrandItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandType: BrandType
  onAdd: (data: AddBrandItemForm & { brandType: BrandType; fileType: string; fileName: string; fileSize: number; file: File }) => void
}

export function AddBrandItemDialog({
  open,
  onOpenChange,
  brandType,
  onAdd,
}: AddBrandItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<AddBrandItemForm>({
    resolver: zodResolver(addBrandItemSchema),
    defaultValues: {
      name: '',
      size: 'medium',
      file: null,
      notes: '',
    },
  })

  const onSubmit = async (data: AddBrandItemForm) => {
    setIsSubmitting(true)
    try {
      const file = data.file[0] as File
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'ai'
      const fileName = file.name
      
      await onAdd({ 
        ...data, 
        brandType,
        fileType,
        fileName,
        fileSize: file.size,
        file: file
      })
      form.reset()
      setSelectedFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error('添加品牌项目失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
      setSelectedFile(null)
    }
    onOpenChange(newOpen)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 验证文件类型
      const fileName = file.name.toLowerCase()
      const isValidType = fileName.endsWith('.pdf') || fileName.endsWith('.ai')
      
      if (!isValidType) {
        alert('只支持PDF和AI文件格式')
        return
      }
      
      // 验证文件大小 (10MB限制)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('文件大小不能超过10MB')
        return
      }
      
      setSelectedFile(file)
      form.setValue('file', event.target.files)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    form.setValue('file', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getBrandTypeLabel = (type: BrandType) => {
    return brandTypeOptions.find(option => option.value === type)?.label || type
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>添加{getBrandTypeLabel(brandType)}项目</DialogTitle>
          <DialogDescription>
            为{getBrandTypeLabel(brandType)}类型添加新的品牌项目
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder='请输入项目名称' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='size'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>尺寸</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='选择尺寸' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem>
                  <FormLabel>文件</FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      {!selectedFile ? (
                        <div
                          className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors'
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
                          <p className='text-sm text-muted-foreground mb-1'>
                            点击上传文件或拖拽文件到此处
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            支持 PDF 和 AI 文件，最大 10MB
                          </p>
                        </div>
                      ) : (
                        <div className='border rounded-lg p-3 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <File className='h-4 w-4 text-muted-foreground' />
                            <div>
                              <p className='text-sm font-medium'>{selectedFile.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={handleRemoveFile}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='.pdf,.ai'
                        onChange={handleFileSelect}
                        className='hidden'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='请输入备注信息（可选）' 
                      className='resize-none'
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type='button' 
                variant='outline' 
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? '添加中...' : '添加项目'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
