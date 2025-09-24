import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newImages: string[] = []
      const remainingSlots = maxImages - images.length

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              if (result) {
                newImages.push(result)
                if (newImages.length === Math.min(files.length, remainingSlots)) {
                  onChange([...images, ...newImages])
                }
              }
            }
            reader.readAsDataURL(file)
          }
        })
    },
    [images, onChange, maxImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className={cn('space-y-4', className)}>
      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {images.map((image, index) => (
            <div key={index} className='group relative'>
              <div className='aspect-square overflow-hidden rounded-lg border'>
                <img
                  src={image}
                  alt={`产品图片 ${index + 1}`}
                  className='h-full w-full object-cover'
                />
              </div>
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute -right-2 -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => removeImage(index)}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className='flex flex-col items-center space-y-2'>
            <div className='rounded-full bg-muted p-3'>
              {isDragging ? (
                <Upload className='h-6 w-6 text-primary' />
              ) : (
                <ImageIcon className='h-6 w-6 text-muted-foreground' />
              )}
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>
                {isDragging ? '释放以上传' : '拖拽图片到此处或点击上传'}
              </p>
              <p className='text-xs text-muted-foreground'>
                支持 JPG, PNG, GIF 格式，最多 {maxImages} 张
              </p>
            </div>
            <input
              type='file'
              multiple
              accept='image/*'
              onChange={(e) => handleFileSelect(e.target.files)}
              className='hidden'
              id='image-upload'
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className='mr-2 h-4 w-4' />
              选择图片
            </Button>
          </div>
        </div>
      )}

      {!canAddMore && (
        <p className='text-sm text-muted-foreground text-center'>
          已达到最大上传数量 ({maxImages} 张)
        </p>
      )}
    </div>
  )
}
