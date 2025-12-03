import type { InputHTMLAttributes, ReactNode } from 'react'
import { Image as ImageIcon, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ImageSearchInputProps = {
  /** 输入框外层 className，控制整体宽度 */
  className?: string
  /** 占位提示文字 */
  placeholder?: string
  /** 输入框的值（可选，支持受控） */
  value?: string
  /** 输入变化回调 */
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange']
  /** 点击图片搜索按钮时触发 */
  onImageSearchClick?: () => void
  /** 自定义尾部内容（例如上传组件），不传则使用默认图片图标按钮 */
  suffix?: ReactNode
}

/**
 * 带图片搜索按钮的搜索输入组件：
 * - 左侧内置放大镜图标 + 文本输入
 * - 右侧是图片搜索按钮（可点击触发上传/弹窗等）
 * - 外部可通过 props 复用在多个页面
 */
export function ImageSearchInput({
  className,
  placeholder = 'Search by name or upload image',
  value,
  onChange,
  onImageSearchClick,
  suffix,
}: ImageSearchInputProps) {
  return (
    <div
      className={cn(
        'bg-background flex h-8 items-center rounded-md border px-2',
        className
      )}
    >
      {/* 搜索图标 + 输入框 */}
      <div className='relative flex-1'>
        <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2' />
        <Input
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className='h-8 border-0 bg-transparent pr-1 pl-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
        />
      </div>

      {/* 尾部：图片搜索按钮 / 自定义内容 */}
      <div className='ml-1 flex items-center'>
        {suffix ? (
          suffix
        ) : (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-7 w-7 rounded-full'
            onClick={onImageSearchClick}
          >
            <ImageIcon className='h-4 w-4' />
            <span className='sr-only'>Search by image</span>
          </Button>
        )}
      </div>
    </div>
  )
}
