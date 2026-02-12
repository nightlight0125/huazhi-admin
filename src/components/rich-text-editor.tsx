import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef, useState } from 'react'

type RichTextEditorProps = {
  initialContent?: string
  onChange?: (value: string) => void
}

export function RichTextEditor({
  initialContent = '',
  onChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)
  const [isLoaded, setIsLoaded] = useState(false)
  const initKeyRef = useRef<string | null>(null)
  const pendingInitialContentRef = useRef<string | undefined>(initialContent)

  // 保持 onChange 引用最新
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const editorElement = editorRef.current
    if (!editorElement) {
      return
    }

    // 检查是否已经初始化
    if (quillRef.current) {
      return
    }

    // 彻底清理：移除所有 Quill 相关的 DOM
    const existingQuill = editorElement.querySelector('.ql-container')
    if (existingQuill) {
      const container = existingQuill.parentElement
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }

    // 移除所有可能的 Quill 工具栏
    const existingToolbar = editorElement.querySelector('.ql-toolbar')
    if (existingToolbar) {
      const toolbarParent = existingToolbar.parentElement
      if (toolbarParent && toolbarParent.parentNode) {
        toolbarParent.parentNode.removeChild(toolbarParent)
      }
    }

    // 完全清空容器
    editorElement.innerHTML = ''

    // 生成唯一的初始化 key
    const initKey = `quill-${Date.now()}-${Math.random()}`
    initKeyRef.current = initKey

    // 使用 requestAnimationFrame 确保 DOM 完全清理后再初始化
    requestAnimationFrame(() => {
      // 再次检查是否已经有实例（防止并发）
      if (quillRef.current || initKeyRef.current !== initKey) {
        return
      }

      // 再次检查并清空
      if (editorElement.querySelector('.ql-container')) {
        editorElement.innerHTML = ''
      }

      try {
        // 自定义图片上传处理器
        const imageHandler = () => {
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/*')
          input.click()

          input.onchange = () => {
            const file = input.files?.[0]
            if (!file) return

            // 验证文件类型
            if (!file.type.startsWith('image/')) {
              alert('请选择图片文件')
              return
            }

            // 验证文件大小（10MB）
            if (file.size > 10 * 1024 * 1024) {
              alert('文件大小不能超过 10MB')
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const base64 = reader.result as string
              const quill = quillRef.current
              if (quill) {
                const range = quill.getSelection(true)
                if (range) {
                  quill.insertEmbed(range.index, 'image', base64)
                  quill.setSelection(range.index + 1, 0)
                } else {
                  // 如果没有选择，在末尾插入
                  const length = quill.getLength()
                  quill.insertEmbed(length - 1, 'image', base64)
                  quill.setSelection(length, 0)
                }
              }
            }
            reader.onerror = () => {
              alert('图片读取失败，请重试')
            }
            reader.readAsDataURL(file)
          }
        }

        // 初始化 Quill
        const quill = new Quill(editorElement, {
          theme: 'snow',
          placeholder: '开始输入...',
          modules: {
            toolbar: {
              container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ align: [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean'],
              ],
              handlers: {
                image: imageHandler,
              },
            },
            clipboard: {
              matchVisual: false,
            },
          },
          formats: [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'color',
            'background',
            'script',
            'list',
            'indent',
            'align',
            'blockquote',
            'code-block',
            'link',
            'image',
            'video',
          ],
        })

        // 验证初始化 key 是否仍然有效（防止重复初始化）
        if (initKeyRef.current === initKey && !quillRef.current) {
          quillRef.current = quill
          setIsLoaded(true)

          // 设置初始内容（优先使用 pendingInitialContentRef，因为它可能包含最新的值）
          const contentToSet = pendingInitialContentRef.current || initialContent
          if (contentToSet) {
            // 使用 Quill 的 API 设置 HTML 内容，而不是直接设置 innerHTML
            quill.clipboard.dangerouslyPasteHTML(0, contentToSet)
            console.log('RichTextEditor: Setting initial content on Quill init:', contentToSet.substring(0, 50))
          }

          // 监听内容变化
          quill.on('text-change', () => {
            const content = quill.root.innerHTML
            onChangeRef.current?.(content)
          })

          // 初始化完成后，再次检查并设置内容（处理异步传入的情况）
          // 使用 requestAnimationFrame 确保 DOM 已完全渲染
          requestAnimationFrame(() => {
            if (quillRef.current && pendingInitialContentRef.current) {
              const currentContent = quillRef.current.root.innerHTML.trim()
              const newContent = (pendingInitialContentRef.current || '').trim()
              if (currentContent !== newContent) {
                // 先清空内容，再设置新内容
                quillRef.current.setContents([])
                // 使用 Quill 的 API 设置 HTML 内容
                quillRef.current.clipboard.dangerouslyPasteHTML(0, pendingInitialContentRef.current)
                console.log('RichTextEditor: Content set after Quill initialization')
              }
            }
          })
        } else {
          // 如果 key 不匹配或已有实例，销毁这个实例
          try {
            const container = quill.container
            if (container && container.parentNode) {
              container.parentNode.removeChild(container)
            }
          } catch (e) {
            // 忽略错误
          }
        }
      } catch (error) {
        console.error('Failed to initialize Quill:', error)
        setIsLoaded(true)
      }
    })

    // 清理函数
    return () => {
      initKeyRef.current = null
      if (quillRef.current) {
        const quill = quillRef.current
        try {
          quill.off('text-change')
          // 尝试移除 Quill 创建的 DOM
          const container = quill.container
          if (container && container.parentNode) {
            container.parentNode.removeChild(container)
          }
        } catch (e) {
          // 忽略错误
        }
        quillRef.current = null
        setIsLoaded(false)
      }
      // 确保容器被清空
      if (editorElement) {
        editorElement.innerHTML = ''
      }
    }
  }, [])

  // 更新 pendingInitialContentRef，确保初始化时能获取到最新的值
  useEffect(() => {
    pendingInitialContentRef.current = initialContent
  }, [initialContent])

  // 当 initialContent 变化时更新编辑器内容
  useEffect(() => {
    if (quillRef.current && initialContent !== undefined) {
      const currentContent = quillRef.current.root.innerHTML.trim()
      const newContent = (initialContent || '').trim()
      // 只有当内容真正不同时才更新，避免不必要的更新
      if (currentContent !== newContent) {
        console.log('RichTextEditor: Updating content from', currentContent.substring(0, 50), 'to', newContent.substring(0, 50))
        // 使用 setTimeout 确保在下一个事件循环中更新，避免与 Quill 的内部状态冲突
        setTimeout(() => {
          if (quillRef.current) {
            // 先清空内容，再设置新内容
            quillRef.current.setContents([])
            // 使用 Quill 的 API 设置 HTML 内容
            quillRef.current.clipboard.dangerouslyPasteHTML(0, initialContent || '')
            console.log('RichTextEditor: Content updated successfully')
          }
        }, 0)
      }
    } else if (!quillRef.current && initialContent) {
      console.log('RichTextEditor: Quill not initialized yet, but initialContent is available:', initialContent.substring(0, 50))
      // 如果 Quill 还没初始化，保存到 ref 中，等待初始化完成后设置
      pendingInitialContentRef.current = initialContent
    }
  }, [initialContent])

  return (
    <div className='relative space-y-2'>
      <div
        ref={editorRef}
        style={{
          height: '300px',
        }}
      />
      {!isLoaded && (
        <div className='bg-background/80 absolute inset-0 flex items-center justify-center rounded-md'>
          <div className='text-muted-foreground'>加载编辑器...</div>
        </div>
      )}
    </div>
  )
}
