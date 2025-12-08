import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Canvas, Group, Image, Textbox } from 'fabric'
import {
  Download,
  Home,
  Image as ImageIcon,
  Layers,
  Minus,
  MoveVertical,
  Pencil,
  Plus,
  Redo2,
  RefreshCw,
  RotateCw,
  Save,
  Trash2,
  Type,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { packagingProducts } from '@/features/packaging-products/data/data'
import { type PackagingProduct } from '@/features/packaging-products/data/schema'
import { products } from '../data/data'
import { type Product } from '../data/schema'

type ActiveTab = 'logo' | 'text' | 'notes'

export function ProductDesign() {
  const { productId } = useParams({
    from: '/_authenticated/products/$productId/design',
  } as any)
  const navigate = useNavigate()

  // 查找产品数据
  const regularProduct = products.find((p) => p.id === productId)
  const packagingProduct = packagingProducts.find((p) => p.id === productId)
  const product = regularProduct || packagingProduct

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('logo')
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const historyIndexRef = useRef(-1)
  const isUpdatingTextRef = useRef(false)
  const [noteName, setNoteName] = useState('')
  const [noteText, setNoteText] = useState('')
  
  // Text editing state
  const [selectedTextObject, setSelectedTextObject] = useState<Textbox | null>(null)
  const [textContent, setTextContent] = useState('Teemdrop')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState(22)
  const [fontOpacity, setFontOpacity] = useState(100)
  const [textSpacing, setTextSpacing] = useState(20)
  const [textColor, setTextColor] = useState('#000000')
  const [textStyles, setTextStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    linethrough: false,
    overline: false,
  })

  // 保存状态函数 - 包含背景图片
  const saveState = useCallback(() => {
    if (!fabricCanvasRef.current || !product) return
    const canvas = fabricCanvasRef.current
    // 手动构建包含背景图片的 JSON
    const canvasJson = canvas.toJSON()
    const productData = product as Product | PackagingProduct
    // 添加背景图片信息到 JSON
    const jsonWithBackground = {
      ...canvasJson,
      backgroundImage: {
        src: productData.image,
        // 保存背景图片的缩放信息
        scaleX: canvas.backgroundImage?.scaleX || 1,
        scaleY: canvas.backgroundImage?.scaleY || 1,
      },
    }
    const json = JSON.stringify(jsonWithBackground)
    const currentIndex = historyIndexRef.current
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(json)
      const newIndex = newHistory.length - 1
      historyIndexRef.current = newIndex
      setHistoryIndex(newIndex)
      return newHistory
    })
  }, [product])

  // 初始化 Fabric.js Canvas
  useEffect(() => {
    if (!canvasRef.current || !product) return

    const canvas = new Canvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: '#ffffff',
    })

    fabricCanvasRef.current = canvas

    // 加载产品图片作为背景
    // 使用 fetch 获取图片并转换为 base64，避免跨域问题
    const productData = product as Product | PackagingProduct
    const loadBackgroundImage = async () => {
      try {
        // 尝试通过 fetch 获取图片（支持 CORS）
        const response = await fetch(productData.image, {
          mode: 'cors',
        })
        if (response.ok) {
          const blob = await response.blob()
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            Image.fromURL(base64)
              .then((img) => {
                const maxSize = 600
                const scale = Math.min(
                  maxSize / (img.width || 1),
                  maxSize / (img.height || 1)
                )
                img.set({
                  left: 0,
                  top: 0,
                  selectable: false,
                  evented: false,
                  scaleX: scale,
                  scaleY: scale,
                })
                canvas.backgroundImage = img
                canvas.renderAll()
                historyIndexRef.current = -1
                setHistoryIndex(-1)
                setTimeout(() => saveState(), 100)
              })
              .catch((error) => {
                console.error('Failed to load image from base64:', error)
                // Fallback: 直接使用 URL
                loadImageDirectly()
              })
          }
          reader.readAsDataURL(blob)
        } else {
          // Fetch 失败，尝试直接加载
          loadImageDirectly()
        }
      } catch (error) {
        console.warn(
          'Failed to fetch image with CORS, trying direct load:',
          error
        )
        // Fetch 失败（可能是 CORS 问题），尝试直接加载
        loadImageDirectly()
      }
    }

    // 直接加载图片（可能无法导出）
    const loadImageDirectly = () => {
      const imgElement = new window.Image()
      imgElement.crossOrigin = 'anonymous'
      imgElement.onload = () => {
        Image.fromURL(productData.image)
          .then((img) => {
            const maxSize = 600
            const scale = Math.min(
              maxSize / (img.width || 1),
              maxSize / (img.height || 1)
            )
            img.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              scaleX: scale,
              scaleY: scale,
            })
            canvas.backgroundImage = img
            canvas.renderAll()
            historyIndexRef.current = -1
            setHistoryIndex(-1)
            setTimeout(() => saveState(), 100)
          })
          .catch((error) => {
            console.error('Failed to load product image:', error)
          })
      }
      imgElement.onerror = () => {
        // 如果 crossOrigin 失败，尝试不使用 crossOrigin
        Image.fromURL(productData.image)
          .then((img) => {
            const maxSize = 600
            const scale = Math.min(
              maxSize / (img.width || 1),
              maxSize / (img.height || 1)
            )
            img.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              scaleX: scale,
              scaleY: scale,
            })
            canvas.backgroundImage = img
            canvas.renderAll()
            historyIndexRef.current = -1
            setHistoryIndex(-1)
            setTimeout(() => saveState(), 100)
          })
          .catch((error) => {
            console.error('Failed to load product image:', error)
          })
      }
      imgElement.src = productData.image
    }

    loadBackgroundImage()

    // 监听对象变化，用于撤销/重做
    const handleObjectAdded = () => {
      setTimeout(() => saveState(), 100)
    }
    const handleObjectModified = () => {
      setTimeout(() => saveState(), 100)
    }
    const handleObjectRemoved = () => {
      setTimeout(() => saveState(), 100)
    }

    canvas.on('object:added', handleObjectAdded)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:removed', handleObjectRemoved)
    
    // 监听对象选择事件，更新文本编辑面板
    const handleSelectionCreated = (e: any) => {
      // 如果正在更新文本对象，跳过选择事件处理
      if (isUpdatingTextRef.current) return
      
      const activeObject = e.selected?.[0] || e.target
      if (activeObject && activeObject.type === 'textbox') {
        const textbox = activeObject as Textbox
        // 只在对象改变时才更新状态
        if (selectedTextObject !== textbox) {
          setSelectedTextObject(textbox)
          setTextContent(textbox.text || '')
          setFontFamily(textbox.fontFamily || 'Arial')
          setFontSize(textbox.fontSize || 22)
          setFontOpacity((textbox.opacity ?? 1) * 100)
          setTextSpacing(textbox.charSpacing ?? 0)
          setTextColor((textbox.fill as string) || '#000000')
          setTextStyles({
            bold: textbox.fontWeight === 'bold' || textbox.fontWeight === 700,
            italic: textbox.fontStyle === 'italic',
            underline: textbox.underline || false,
            linethrough: textbox.linethrough || false,
            overline: textbox.overline || false,
          })
        }
      } else if (!activeObject || activeObject.type !== 'textbox') {
        setSelectedTextObject(null)
      }
    }
    
    const handleSelectionCleared = () => {
      setSelectedTextObject(null)
    }
    
    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', handleSelectionCreated)
    canvas.on('selection:cleared', handleSelectionCleared)

    // 监听双击事件 - 编辑文本
    const handleMouseDblClick = (e: any) => {
      const activeObject = e.target
      if (!activeObject) return

      // 如果是 Group，查找其中的 Text 对象
      if (activeObject.type === 'group') {
        const group = activeObject as unknown as Group
        const textObj = group
          .getObjects()
          .find((obj) => obj.type === 'text' || obj.type === 'textbox')
        if (textObj) {
          // 从 Group 中提取 Text，创建可编辑的 Textbox
          const groupLeft = group.left || 0
          const groupTop = group.top || 0

          // 获取文本的当前文本内容
          const currentText = (textObj as any).text || '双击编辑备注'
          const textLeft = (textObj.left || 0) + groupLeft
          const textTop = (textObj.top || 0) + groupTop

          // 创建新的 Textbox 来编辑
          const textbox = new Textbox(currentText, {
            left: textLeft,
            top: textTop,
            width: 150,
            fontSize: 14,
            fill: '#78350f',
            textAlign: 'center',
            backgroundColor: '#fef3c7',
            fontFamily: 'Arial',
          })

          // 删除旧的 Group，添加新的 Textbox
          canvas.remove(group)
          canvas.add(textbox)
          canvas.setActiveObject(textbox)
          textbox.enterEditing()
          canvas.renderAll()
          return
        }
      }

      // 如果是 Textbox，直接进入编辑模式
      if (activeObject.type === 'textbox') {
        const textbox = activeObject as unknown as Textbox
        textbox.enterEditing()
        canvas.renderAll()
      }
    }
    canvas.on('mouse:dblclick', handleMouseDblClick)

    // 监听键盘事件 - 删除键
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        canvas.getActiveObject()
      ) {
        canvas.remove(canvas.getActiveObject()!)
        canvas.renderAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.off('object:added', handleObjectAdded)
      canvas.off('object:modified', handleObjectModified)
      canvas.off('object:removed', handleObjectRemoved)
      canvas.off('mouse:dblclick', handleMouseDblClick)
      canvas.off('selection:created', handleSelectionCreated)
      canvas.off('selection:updated', handleSelectionCreated)
      canvas.off('selection:cleared', handleSelectionCleared)
      window.removeEventListener('keydown', handleKeyDown)
      canvas.dispose()
    }
  }, [product, saveState])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0 || !fabricCanvasRef.current) return

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
        // 添加图片到画布（本地文件不需要 crossOrigin）
        Image.fromURL(result)
          .then((img) => {
            // 自动调整大小以适应画布
            const maxWidth = 200
            const maxHeight = 200
            const scale = Math.min(
              maxWidth / (img.width || 1),
              maxHeight / (img.height || 1),
              1
            )
            img.set({
              left: 100,
              top: 100,
              scaleX: scale,
              scaleY: scale,
            })
            fabricCanvasRef.current?.add(img)
            fabricCanvasRef.current?.setActiveObject(img)
            fabricCanvasRef.current?.renderAll()
          })
          .catch((error) => {
            console.error('Failed to load image:', error)
            alert('图片加载失败，请重试')
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

  // 恢复背景图片的辅助函数
  const restoreBackgroundImage = useCallback(
    (scaleX?: number, scaleY?: number) => {
      if (!fabricCanvasRef.current || !product) return Promise.resolve()
      const productData = product as Product | PackagingProduct
      return Image.fromURL(productData.image)
        .then((img) => {
          const maxSize = 600
          const defaultScale = Math.min(
            maxSize / (img.width || 1),
            maxSize / (img.height || 1)
          )
          img.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            scaleX: scaleX || defaultScale,
            scaleY: scaleY || defaultScale,
          })
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.backgroundImage = img
            fabricCanvasRef.current.renderAll()
          }
        })
        .catch((error) => {
          console.error('Failed to restore background image:', error)
        })
    },
    [product]
  )

  const handleUndo = () => {
    if (!fabricCanvasRef.current || historyIndex <= 0 || !product) return
    const prevState = history[historyIndex - 1]
    const parsedState = JSON.parse(prevState)

    // 保存当前背景图片的引用，避免被覆盖
    const currentBackground = fabricCanvasRef.current.backgroundImage

    // 恢复画布状态（只恢复对象，不恢复背景）
    const canvasJson = { ...parsedState }
    delete canvasJson.backgroundImage // 移除背景图片，避免被覆盖

    fabricCanvasRef.current.loadFromJSON(JSON.stringify(canvasJson), () => {
      // 恢复背景图片
      if (parsedState.backgroundImage?.src) {
        restoreBackgroundImage(
          parsedState.backgroundImage.scaleX,
          parsedState.backgroundImage.scaleY
        ).then(() => {
          fabricCanvasRef.current?.renderAll()
        })
      } else if (currentBackground) {
        // 如果没有保存的背景信息，保持当前背景
        fabricCanvasRef.current!.backgroundImage = currentBackground
        fabricCanvasRef.current?.renderAll()
      }

      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      historyIndexRef.current = newIndex
    })
  }

  const handleRedo = () => {
    if (
      !fabricCanvasRef.current ||
      historyIndex >= history.length - 1 ||
      !product
    )
      return
    const nextState = history[historyIndex + 1]
    const parsedState = JSON.parse(nextState)

    // 保存当前背景图片的引用，避免被覆盖
    const currentBackground = fabricCanvasRef.current.backgroundImage

    // 恢复画布状态（只恢复对象，不恢复背景）
    const canvasJson = { ...parsedState }
    delete canvasJson.backgroundImage // 移除背景图片，避免被覆盖

    fabricCanvasRef.current.loadFromJSON(JSON.stringify(canvasJson), () => {
      // 恢复背景图片
      if (parsedState.backgroundImage?.src) {
        restoreBackgroundImage(
          parsedState.backgroundImage.scaleX,
          parsedState.backgroundImage.scaleY
        ).then(() => {
          fabricCanvasRef.current?.renderAll()
        })
      } else if (currentBackground) {
        // 如果没有保存的背景信息，保持当前背景
        fabricCanvasRef.current!.backgroundImage = currentBackground
        fabricCanvasRef.current?.renderAll()
      }

      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      historyIndexRef.current = newIndex
    })
  }

  const handleZoomIn = () => {
    if (!fabricCanvasRef.current) return
    const newZoom = Math.min(zoom + 10, 200)
    setZoom(newZoom)
    const canvas = fabricCanvasRef.current
    canvas.setZoom(newZoom / 100)
    canvas.renderAll()
  }

  const handleZoomOut = () => {
    if (!fabricCanvasRef.current) return
    const newZoom = Math.max(zoom - 10, 50)
    setZoom(newZoom)
    const canvas = fabricCanvasRef.current
    canvas.setZoom(newZoom / 100)
    canvas.renderAll()
  }

  const handleZoomReset = () => {
    if (!fabricCanvasRef.current) return
    setZoom(100)
    const canvas = fabricCanvasRef.current
    canvas.setZoom(1)
    canvas.renderAll()
  }

  const handleAddText = () => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const center = canvas.getCenter()
    const text = new Textbox(textContent || 'Teemdrop', {
      left: (center.left || 0) - 100,
      top: (center.top || 0) - 15,
      width: 200,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textColor,
      textAlign: 'center',
      opacity: fontOpacity / 100,
      charSpacing: textSpacing,
      fontWeight: textStyles.bold ? 'bold' : 'normal',
      fontStyle: textStyles.italic ? 'italic' : 'normal',
      underline: textStyles.underline,
      linethrough: textStyles.linethrough,
      overline: textStyles.overline,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    setSelectedTextObject(text)
    canvas.renderAll()
  }
  
  // 更新文本对象属性 - 使用 ref 来避免依赖问题
  const updateTextObjectRef = useRef<((updates: any) => void) | null>(null)
  
  updateTextObjectRef.current = (updates: Partial<{
    text: string
    fontFamily: string
    fontSize: number
    opacity: number
    charSpacing: number
    fill: string
    fontWeight: string | number
    fontStyle: string
    underline: boolean
    linethrough: boolean
    overline: boolean
  }>) => {
    if (!fabricCanvasRef.current || !selectedTextObject) return
    const canvas = fabricCanvasRef.current
    
    // 设置标志，防止选择事件触发状态更新
    isUpdatingTextRef.current = true
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'text') {
        selectedTextObject.set('text', value as string)
      } else if (key === 'charSpacing') {
        // charSpacing 在 Fabric.js 中直接使用数值
        selectedTextObject.set('charSpacing', value as number)
      } else {
        ;(selectedTextObject as any)[key] = value
      }
    })
    
    // 强制重新计算尺寸
    selectedTextObject.setCoords()
    canvas.renderAll()
    
    // 延迟保存状态，避免频繁保存
    setTimeout(() => {
      saveState()
      isUpdatingTextRef.current = false
    }, 200)
  }
  
  // 文本内容变化 - 使用防抖来优化性能
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    
    const timeoutId = setTimeout(() => {
      if (updateTextObjectRef.current && selectedTextObject.text !== textContent) {
        updateTextObjectRef.current({ text: textContent })
      }
    }, 50)
    
    return () => clearTimeout(timeoutId)
  }, [textContent, selectedTextObject])
  
  // 字体家族变化
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    if (updateTextObjectRef.current && selectedTextObject.fontFamily !== fontFamily) {
      updateTextObjectRef.current({ fontFamily })
    }
  }, [fontFamily, selectedTextObject])
  
  // 字体大小变化
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    if (updateTextObjectRef.current && selectedTextObject.fontSize !== fontSize) {
      updateTextObjectRef.current({ fontSize })
    }
  }, [fontSize, selectedTextObject])
  
  // 透明度变化
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    const newOpacity = fontOpacity / 100
    if (updateTextObjectRef.current && selectedTextObject.opacity !== newOpacity) {
      updateTextObjectRef.current({ opacity: newOpacity })
    }
  }, [fontOpacity, selectedTextObject])
  
  // 间距变化
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    if (updateTextObjectRef.current && selectedTextObject.charSpacing !== textSpacing) {
      updateTextObjectRef.current({ charSpacing: textSpacing })
    }
  }, [textSpacing, selectedTextObject])
  
  // 颜色变化
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    if (updateTextObjectRef.current && selectedTextObject.fill !== textColor) {
      updateTextObjectRef.current({ fill: textColor })
    }
  }, [textColor, selectedTextObject])
  
  // 样式变化
  useEffect(() => {
    if (!selectedTextObject || isUpdatingTextRef.current) return
    if (updateTextObjectRef.current) {
      const currentBold = selectedTextObject.fontWeight === 'bold' || selectedTextObject.fontWeight === 700
      const currentItalic = selectedTextObject.fontStyle === 'italic'
      
      if (currentBold !== textStyles.bold || 
          currentItalic !== textStyles.italic ||
          selectedTextObject.underline !== textStyles.underline ||
          selectedTextObject.linethrough !== textStyles.linethrough ||
          selectedTextObject.overline !== textStyles.overline) {
        updateTextObjectRef.current({
          fontWeight: textStyles.bold ? 'bold' : 'normal',
          fontStyle: textStyles.italic ? 'italic' : 'normal',
          underline: textStyles.underline,
          linethrough: textStyles.linethrough,
          overline: textStyles.overline,
        })
      }
    }
  }, [textStyles, selectedTextObject])

  const handleRotate = () => {
    if (!fabricCanvasRef.current) return
    const activeObject = fabricCanvasRef.current.getActiveObject()
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + 90)
      fabricCanvasRef.current.renderAll()
    }
  }

  const handleDelete = () => {
    if (!fabricCanvasRef.current) return
    const activeObject = fabricCanvasRef.current.getActiveObject()
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject)
      fabricCanvasRef.current.renderAll()
    }
  }

  const handleRefresh = () => {
    if (!fabricCanvasRef.current || !product) return
    if (!confirm('确定要清除所有设计元素吗？')) return
    const canvas = fabricCanvasRef.current
    // 清除所有对象（保留背景）
    const objects = canvas.getObjects()
    objects.forEach((obj) => canvas.remove(obj))
    canvas.renderAll()
    setHistory([])
    setHistoryIndex(-1)
    historyIndexRef.current = -1
    // 重新保存状态
    setTimeout(() => saveState(), 100)
  }

  const handleSaveImage = async () => {
    if (!fabricCanvasRef.current || !product) return

    try {
      const canvas = fabricCanvasRef.current
      const productData = product as Product | PackagingProduct

      // 使用 fabric.js 的 toDataURL 方法导出图片
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `${productData.name || 'design'}-${Date.now()}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to save image:', error)
      alert('保存图片失败。请确保所有图片都已正确加载。')
    }
  }

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

  return (
    <div className='flex h-screen flex-col bg-background'>
      {/* Top Toolbar */}
      <div className='flex items-center justify-between border-b border-border bg-background px-4 py-3'>
        <div className='flex items-center gap-3'>
          <Home className='h-4 w-4' />
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
          <Button
            variant='ghost'
            size='icon'
            onClick={handleRotate}
            title='Rotate'
            className='h-8 w-8'
          >
            <RotateCw className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            title='Layers'
            className='h-8 w-8'
          >
            <Layers className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            title='Align Vertical'
            className='h-8 w-8'
          >
            <MoveVertical className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleZoomOut}
            title='Zoom Out'
            className='h-8 w-8'
          >
            <Minus className='h-4 w-4' />
          </Button>
          <span className='text-muted-foreground text-xs'>{zoom}%</span>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleZoomIn}
            title='Zoom In'
            className='h-8 w-8'
          >
            <Plus className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleZoomReset}
            title='Reset Zoom'
            className='h-8 w-8'
          >
            <X className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleDelete}
            title='Delete Selected'
            className='h-8 w-8'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleSaveImage}
            title='Save Image'
            className='h-8 w-8'
          >
            <Download className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleRefresh}
            title='Clear All'
            className='h-8 w-8'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            title='Cancel changes'
            className='h-8 w-8'
            // TODO: implement actual cancel/restore logic
          >
            <X className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            title='Save design'
            className='h-8 w-8'
          >
            <Save className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar */}
        <div className='w-64 border-r border-border bg-muted/50 p-4'>
          <div className='mb-6'>
            <div className='space-y-1'>
              <button
                onClick={() => setActiveTab('logo')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  activeTab === 'logo'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <ImageIcon className='h-5 w-5' />
                <span>Logo</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('text')
                  if (!selectedTextObject) {
                    handleAddText()
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  activeTab === 'text'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Type className='h-5 w-5 text-lg font-bold' />
                <span>Add Text</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('notes')
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  activeTab === 'notes'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
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
                  'cursor-pointer rounded-md border-2 border-dashed border-border bg-background p-6 text-center transition-colors',
                  'hover:border-primary/50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className='flex flex-col items-center space-y-2'>
                  <Plus className='text-muted-foreground h-6 w-6' />
                  <p className='text-muted-foreground text-sm'>
                    Click or drag files here to upload
                  </p>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    Only png, jpg, JPEG can be uploaded, and the size does not
                    exceed 10MB
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
                <div className='overflow-hidden rounded-md border border-border bg-background'>
                  <img
                    src={uploadedLogo}
                    alt='Uploaded logo'
                    className='h-auto w-full'
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className='space-y-4'>
              <div className='text-lg font-semibold text-foreground'>Text</div>
              
              {/* Text Content */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Text content:</Label>
                <Textarea
                  value={textContent}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setTextContent(newValue)
                    // 立即更新到画布，不等待 useEffect
                    if (selectedTextObject) {
                      isUpdatingTextRef.current = true
                      selectedTextObject.set('text', newValue)
                      selectedTextObject.setCoords()
                      fabricCanvasRef.current?.renderAll()
                      setTimeout(() => {
                        isUpdatingTextRef.current = false
                        saveState()
                      }, 200)
                    }
                  }}
                  className='min-h-[80px] resize-none'
                  placeholder='Enter text'
                />
              </div>

              {/* Font Family */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Font family:</Label>
                <Select value={fontFamily} onValueChange={(value) => {
                  setFontFamily(value)
                  // 立即更新，不等待 useEffect
                  if (selectedTextObject && updateTextObjectRef.current) {
                    isUpdatingTextRef.current = true
                    selectedTextObject.set('fontFamily', value)
                    fabricCanvasRef.current?.renderAll()
                    setTimeout(() => {
                      isUpdatingTextRef.current = false
                      saveState()
                    }, 100)
                  }
                }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Arial'>Arial</SelectItem>
                    <SelectItem value='Helvetica'>Helvetica</SelectItem>
                    <SelectItem value='Times New Roman'>Times New Roman</SelectItem>
                    <SelectItem value='Courier New'>Courier New</SelectItem>
                    <SelectItem value='Verdana'>Verdana</SelectItem>
                    <SelectItem value='Georgia'>Georgia</SelectItem>
                    <SelectItem value='Palatino'>Palatino</SelectItem>
                    <SelectItem value='Garamond'>Garamond</SelectItem>
                    <SelectItem value='Comic Sans MS'>Comic Sans MS</SelectItem>
                    <SelectItem value='Impact'>Impact</SelectItem>
                    <SelectItem value='sans-serif'>Sans-serif</SelectItem>
                    <SelectItem value='serif'>Serif</SelectItem>
                    <SelectItem value='monospace'>Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Font size: {fontSize}</Label>
                <input
                  type='range'
                  min='8'
                  max='100'
                  value={fontSize}
                  onChange={(e) => {
                    const newValue = Number(e.target.value)
                    setFontSize(newValue)
                    // 立即更新到画布
                    if (selectedTextObject) {
                      isUpdatingTextRef.current = true
                      selectedTextObject.set('fontSize', newValue)
                      selectedTextObject.setCoords()
                      fabricCanvasRef.current?.renderAll()
                      setTimeout(() => {
                        isUpdatingTextRef.current = false
                        saveState()
                      }, 200)
                    }
                  }}
                  className='w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(fontSize - 8) / (100 - 8) * 100}%, hsl(var(--muted)) ${(fontSize - 8) / (100 - 8) * 100}%, hsl(var(--muted)) 100%)`
                  }}
                />
              </div>

              {/* Font Opacity */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Font opacity: {fontOpacity}</Label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={fontOpacity}
                  onChange={(e) => {
                    const newValue = Number(e.target.value)
                    setFontOpacity(newValue)
                    // 立即更新到画布
                    if (selectedTextObject) {
                      isUpdatingTextRef.current = true
                      selectedTextObject.set('opacity', newValue / 100)
                      fabricCanvasRef.current?.renderAll()
                      setTimeout(() => {
                        isUpdatingTextRef.current = false
                        saveState()
                      }, 200)
                    }
                  }}
                  className='w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${fontOpacity}%, hsl(var(--muted)) ${fontOpacity}%, hsl(var(--muted)) 100%)`
                  }}
                />
              </div>

              {/* Spacing */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Spacing: {textSpacing}</Label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={textSpacing}
                  onChange={(e) => {
                    const newValue = Number(e.target.value)
                    setTextSpacing(newValue)
                    // 立即更新到画布
                    if (selectedTextObject) {
                      isUpdatingTextRef.current = true
                      selectedTextObject.set('charSpacing', newValue)
                      selectedTextObject.setCoords()
                      fabricCanvasRef.current?.renderAll()
                      setTimeout(() => {
                        isUpdatingTextRef.current = false
                        saveState()
                      }, 200)
                    }
                  }}
                  className='w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${textSpacing}%, hsl(var(--muted)) ${textSpacing}%, hsl(var(--muted)) 100%)`
                  }}
                />
              </div>

              {/* Text Color */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Text color: {textColor}</Label>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-10 w-10 rounded border border-border cursor-pointer'
                    style={{ backgroundColor: textColor }}
                  />
                  <Input
                    type='color'
                    value={textColor}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setTextColor(newValue)
                      // 立即更新到画布
                      if (selectedTextObject) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('fill', newValue)
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className='flex-1 h-10 cursor-pointer'
                  />
                  <Input
                    type='text'
                    value={textColor}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setTextColor(newValue)
                      // 立即更新到画布
                      if (selectedTextObject && /^#[0-9A-F]{6}$/i.test(newValue)) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('fill', newValue)
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className='w-24 h-10 font-mono text-sm'
                    placeholder='#000000'
                  />
                </div>
              </div>

              {/* Text Styling Buttons */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Text Styling</Label>
                <div className='grid grid-cols-3 gap-2'>
                  <Button
                    type='button'
                    variant={textStyles.bold ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      const newBold = !textStyles.bold
                      setTextStyles(prev => ({ ...prev, bold: newBold }))
                      // 立即更新到画布
                      if (selectedTextObject) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('fontWeight', newBold ? 'bold' : 'normal')
                        selectedTextObject.setCoords()
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className={cn(
                      textStyles.bold && 'bg-primary text-primary-foreground'
                    )}
                  >
                    Bold
                  </Button>
                  <Button
                    type='button'
                    variant={textStyles.italic ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      const newItalic = !textStyles.italic
                      setTextStyles(prev => ({ ...prev, italic: newItalic }))
                      // 立即更新到画布
                      if (selectedTextObject) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('fontStyle', newItalic ? 'italic' : 'normal')
                        selectedTextObject.setCoords()
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className={cn(
                      textStyles.italic && 'bg-primary text-primary-foreground'
                    )}
                  >
                    Italic
                  </Button>
                  <Button
                    type='button'
                    variant={textStyles.underline ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      const newUnderline = !textStyles.underline
                      setTextStyles(prev => ({ ...prev, underline: newUnderline }))
                      // 立即更新到画布
                      if (selectedTextObject) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('underline', newUnderline)
                        selectedTextObject.setCoords()
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className={cn(
                      textStyles.underline && 'bg-primary text-primary-foreground'
                    )}
                  >
                    Underline
                  </Button>
                  <Button
                    type='button'
                    variant={textStyles.linethrough ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      const newLinethrough = !textStyles.linethrough
                      setTextStyles(prev => ({ ...prev, linethrough: newLinethrough }))
                      // 立即更新到画布
                      if (selectedTextObject) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('linethrough', newLinethrough)
                        selectedTextObject.setCoords()
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className={cn(
                      textStyles.linethrough && 'bg-primary text-primary-foreground'
                    )}
                  >
                    Linethrough
                  </Button>
                  <Button
                    type='button'
                    variant={textStyles.overline ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      const newOverline = !textStyles.overline
                      setTextStyles(prev => ({ ...prev, overline: newOverline }))
                      // 立即更新到画布
                      if (selectedTextObject) {
                        isUpdatingTextRef.current = true
                        selectedTextObject.set('overline', newOverline)
                        selectedTextObject.setCoords()
                        fabricCanvasRef.current?.renderAll()
                        setTimeout(() => {
                          isUpdatingTextRef.current = false
                          saveState()
                        }, 200)
                      }
                    }}
                    className={cn(
                      textStyles.overline && 'bg-primary text-primary-foreground'
                    )}
                  >
                    Overline
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='text-sm font-medium text-foreground'>Name</div>
                <Input
                  placeholder='Enter name'
                  value={noteName}
                  onChange={(e) => setNoteName(e.target.value)}
                  className='h-9'
                />
              </div>

              <div className='space-y-2'>
                <div className='text-sm font-medium text-foreground'>Notes</div>
                <div className='relative'>
                  <Textarea
                    placeholder='Enter notes'
                    value={noteText}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 500) {
                        setNoteText(value)
                      }
                    }}
                    className='min-h-[140px] resize-none pr-12'
                  />
                  <span className='text-muted-foreground absolute right-3 bottom-2 text-xs'>
                    {noteText.length}/500
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className='flex flex-1 flex-col overflow-hidden bg-background'>
          <div className='flex flex-1 items-center justify-center overflow-auto bg-muted/30 p-8'>
            <div className='bg-background shadow-lg'>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
