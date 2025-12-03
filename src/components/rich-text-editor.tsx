import { useEffect, useState } from 'react'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from '@lexical/list'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
} from 'lexical'
import { AlignCenter, AlignLeft, AlignRight, Image, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type RichTextEditorProps = {
  initialContent?: string
  onChange?: (value: string) => void
}

// 工具栏按钮组件
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const handleBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }

  const handleItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }

  const handleUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }

  const handleAlignLeft = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
  }

  const handleAlignCenter = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
  }

  const handleAlignRight = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
  }

  const handleBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }

  const handleOrderedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
      setLinkUrl('')
      setLinkDialogOpen(false)
    }
  }

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          // Create a paragraph with the image as HTML
          const imgHtml = `<img src="${imageUrl}" style="max-width: 100%; height: auto; display: block; margin: 4px 0;" />`
          const parser = new DOMParser()
          const dom = parser.parseFromString(imgHtml, 'text/html')
          const nodes = $generateNodesFromDOM(editor, dom)
          $insertNodes(nodes)
        }
      })
      setImageUrl('')
      setImageDialogOpen(false)
    }
  }

  return (
    <>
      <div className='bg-muted inline-flex flex-wrap gap-1 rounded-md border px-1 py-1'>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={handleBold}
        >
          B
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px] italic'
          onClick={handleItalic}
        >
          I
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px] underline'
          onClick={handleUnderline}
        >
          U
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={handleAlignLeft}
          title='Align Left'
        >
          <AlignLeft className='h-3 w-3' />
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={handleAlignCenter}
          title='Align Center'
        >
          <AlignCenter className='h-3 w-3' />
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={handleAlignRight}
          title='Align Right'
        >
          <AlignRight className='h-3 w-3' />
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={handleBulletList}
        >
          • List
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={handleOrderedList}
        >
          1. List
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={() => setLinkDialogOpen(true)}
          title='Insert Link'
        >
          <Link className='h-3 w-3' />
        </button>
        <button
          type='button'
          className='hover:bg-background rounded px-2 py-0.5 text-[11px]'
          onClick={() => setImageDialogOpen(true)}
          title='Insert Image'
        >
          <Image className='h-3 w-3' />
        </button>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='link-url'>URL</Label>
              <Input
                id='link-url'
                placeholder='https://example.com'
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInsertLink()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setLinkUrl('')
                setLinkDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleInsertLink} disabled={!linkUrl.trim()}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='image-url'>Image URL</Label>
              <Input
                id='image-url'
                placeholder='https://example.com/image.jpg'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInsertImage()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setImageUrl('')
                setImageDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleInsertImage} disabled={!imageUrl.trim()}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function RichTextEditor({
  initialContent = '',
  onChange,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: {},
    nodes: [ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error(error)
    },
    editorState: undefined, // Will be initialized by InitializePlugin
  }

  // Initialize editor with HTML content
  function InitializePlugin({ initialContent }: { initialContent: string }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
      if (initialContent) {
        editor.update(() => {
          const parser = new DOMParser()
          const dom = parser.parseFromString(initialContent, 'text/html')
          const nodes = $generateNodesFromDOM(editor, dom)
          const root = $getRoot()
          root.clear()
          root.append(...nodes)
        })
      }
    }, [editor, initialContent])

    return null
  }

  // Plugin to handle changes and convert to HTML
  function OnChangeHTMLPlugin() {
    const [editor] = useLexicalComposerContext()

    return (
      <OnChangePlugin
        onChange={(editorState: EditorState) => {
          editorState.read(() => {
            // Convert Lexical state to HTML
            const selection = null // Generate HTML for entire editor
            const htmlString = $generateHtmlFromNodes(editor, selection)
            onChange?.(htmlString)
          })
        }}
      />
    )
  }

  return (
    <div className='space-y-2'>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <InitializePlugin initialContent={initialContent} />
        <div className='bg-background focus-visible:ring-ring relative min-h-[160px] rounded-md border px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2'>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className='min-h-[140px] outline-none' />
            }
            placeholder={
              <div className='text-muted-foreground pointer-events-none absolute top-2 left-3'>
                Start typing...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangeHTMLPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}
