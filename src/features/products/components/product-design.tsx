import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Pencil,
  Upload,
  Undo2,
  Redo2,
  RotateCw,
  Layers,
  MoveVertical,
  Minus,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { products } from '../data/data'
import { packagingProducts } from '@/features/packaging-products/data/data'
import { type Product } from '../data/schema'
import { type PackagingProduct } from '@/features/packaging-products/data/schema'

type DesignElement = {
  id: string
  type: 'logo' | 'text' | 'note'
  x: number
  y: number
  width: number
  height: number
  content?: string
  imageUrl?: string
  selected?: boolean
}

type ActiveTab = 'logo' | 'text' | 'notes'

export function ProductDesign() {
  const { productId } = useParams({ from: '/_authenticated/products/$productId/design' } as any)
  const navigate = useNavigate()
  
  // 查找产品数据
  const regularProduct = products.find((p) => p.id === productId)
  const packagingProduct = packagingProducts.find((p) => p.id === productId)
  const product = regularProduct || packagingProduct

  const [activeTab, setActiveTab] = useState<ActiveTab>('logo')
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null)
  const [elements, setElements] = useState<DesignElement[]>([])
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<DesignElement[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    // 验证文件类型
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      alert('只支持 PNG, JPG, JPEG 格式')
      return
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setUploadedLogo(result)
        // 添加一个logo元素到画布
        const newElement: DesignElement = {
          id: `logo-${Date.now()}`,
          type: 'logo',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          imageUrl: result,
          selected: true,
        }
        addToHistory()
        setElements((prev) => {
          const updated = prev.map((el) => ({ ...el, selected: false }))
          return [...updated, newElement]
        })
      }
    }
    reader.readAsDataURL(file)
  }, [])

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

  const addToHistory = useCallback(() => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1)
      newHistory.push([...elements])
      setHistoryIndex(newHistory.length - 1)
      return newHistory
    })
  }, [elements, historyIndex])

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements([...history[historyIndex - 1]])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements([...history[historyIndex + 1]])
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  const handleAddText = () => {
    const newElement: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 150,
      y: 150,
      width: 200,
      height: 50,
      content: 'Text',
      selected: true,
    }
    addToHistory()
    setElements((prev) => {
      const updated = prev.map((el) => ({ ...el, selected: false }))
      return [...updated, newElement]
    })
  }

  const handleAddNote = () => {
    const newElement: DesignElement = {
      id: `note-${Date.now()}`,
      type: 'note',
      x: 200,
      y: 200,
      width: 150,
      height: 100,
      content: 'Note',
      selected: true,
    }
    addToHistory()
    setElements((prev) => {
      const updated = prev.map((el) => ({ ...el, selected: false }))
      return [...updated, newElement]
    })
  }

  const handleElementClick = (elementId: string) => {
    addToHistory()
    setElements((prev) =>
      prev.map((el) => ({
        ...el,
        selected: el.id === elementId,
      }))
    )
  }

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const elementRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const container = (e.currentTarget.parentElement?.parentElement as HTMLElement)
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const scale = zoom / 100

    setDragging(elementId)
    setDragOffset({
      x: (e.clientX - containerRect.left) / scale - element.x,
      y: (e.clientY - containerRect.top) / scale - element.y,
    })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return

      const container = e.currentTarget as HTMLElement
      const productImage = container.querySelector('img')
      if (!productImage) return

      const imageRect = productImage.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const scale = zoom / 100

      // 计算相对于图片的位置
      const x = (e.clientX - imageRect.left) / scale - dragOffset.x
      const y = (e.clientY - imageRect.top) / scale - dragOffset.y

      const element = elements.find((el) => el.id === dragging)
      if (!element) return

      const maxX = (imageRect.width / scale) - element.width
      const maxY = (imageRect.height / scale) - element.height

      setElements((prev) =>
        prev.map((el) =>
          el.id === dragging
            ? {
                ...el,
                x: Math.max(0, Math.min(x, maxX)),
                y: Math.max(0, Math.min(y, maxY)),
              }
            : el
        )
      )
    },
    [dragging, dragOffset, zoom, elements]
  )

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, historyIndex + 1)
        newHistory.push([...elements])
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      })
    }
    setDragging(null)
  }, [dragging, elements, historyIndex])

  if (!product) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold'>产品未找到</h2>
          <Button onClick={() => navigate({ to: '/products' })}>
            返回产品列表
          </Button>
        </div>
      </div>
    )
  }

  const productData = product as Product | PackagingProduct

  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Top Toolbar */}
      <div className='flex items-center justify-between border-b bg-white px-4 py-3'>
        <div className='flex items-center gap-3'>
          <h2 className='text-sm font-semibold'>Upload</h2>
          <Switch id='toggle' defaultChecked />
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title='Undo'
            className='h-8 w-8'
          >
            <Undo2 className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title='Redo'
            className='h-8 w-8'
          >
            <Redo2 className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' title='Rotate' className='h-8 w-8'>
            <RotateCw className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' title='Layers' className='h-8 w-8'>
            <Layers className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' title='Align Vertical' className='h-8 w-8'>
            <MoveVertical className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' onClick={handleZoomOut} title='Zoom Out' className='h-8 w-8'>
            <Minus className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' onClick={handleZoomIn} title='Zoom In' className='h-8 w-8'>
            <Plus className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' title='Refresh' className='h-8 w-8'>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar */}
        <div className='w-64 border-r bg-gray-50 p-4'>
          <div className='mb-6'>
            <div className='space-y-1'>
              <button
                onClick={() => setActiveTab('logo')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  activeTab === 'logo'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-200'
                )}
              >
                <ImageIcon className='h-5 w-5' />
                <span>Logo</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('text')
                  handleAddText()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  activeTab === 'text'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-200'
                )}
              >
                <Type className='h-5 w-5 text-lg font-bold' />
                <span>Add Text</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('notes')
                  handleAddNote()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  activeTab === 'notes'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-200'
                )}
              >
                <Pencil className='h-5 w-5' />
                <span>Notes</span>
              </button>
            </div>
          </div>

          {activeTab === 'logo' && (
            <div className='space-y-4'>
              <div
                className={cn(
                  'border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors bg-white',
                  'hover:border-primary/50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className='flex flex-col items-center space-y-2'>
                  <Plus className='h-6 w-6 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground'>
                    Click or drag files here to upload
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Only png, jpg, JPEG can be uploaded, and the size does not exceed 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/png,image/jpg,image/jpeg'
                  className='hidden'
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
              {uploadedLogo && (
                <div className='rounded-md border overflow-hidden bg-white'>
                  <img
                    src={uploadedLogo}
                    alt='Uploaded logo'
                    className='w-full h-auto'
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col overflow-hidden bg-white'>
          <div
            className='flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center'
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className='relative bg-white shadow-lg inline-block'
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
              }}
            >
              {/* Product Image */}
              <img
                src={productData.image}
                alt={productData.name}
                className='max-w-full h-auto block'
                style={{ maxHeight: '600px', maxWidth: '600px' }}
              />

              {/* Design Elements Overlay */}
              <div className='absolute inset-0 pointer-events-none'>
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={cn(
                      'absolute border-2 pointer-events-auto',
                      dragging === element.id ? 'cursor-grabbing' : 'cursor-move',
                      element.selected
                        ? 'border-red-500 border-dashed'
                        : 'border-transparent hover:border-gray-300'
                    )}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleElementClick(element.id)
                    }}
                    onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                  >
                    {element.type === 'logo' && element.imageUrl && (
                      <img
                        src={element.imageUrl}
                        alt='Logo'
                        className='w-full h-full object-contain pointer-events-none'
                      />
                    )}
                    {element.type === 'text' && (
                      <div className='w-full h-full flex items-center justify-center bg-white/90 p-2 pointer-events-none'>
                        <span className='text-sm font-semibold text-black'>{element.content}</span>
                      </div>
                    )}
                    {element.type === 'note' && (
                      <div className='w-full h-full flex items-center justify-center bg-yellow-100/90 p-2 border border-yellow-300 rounded pointer-events-none'>
                        <span className='text-xs text-gray-700'>{element.content}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

