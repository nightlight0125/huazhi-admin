import { useEffect, useRef, useState } from 'react'

type RichTextEditorProps = {
  initialContent?: string
  onChange?: (value: string) => void
}

export function RichTextEditor({
  initialContent = '',
  onChange,
}: RichTextEditorProps) {
  const [value, setValue] = useState(initialContent)
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setValue(initialContent)
  }, [initialContent])

  const handleCommand = (command: string) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false)
      if (editorRef.current) {
        const html = editorRef.current.innerHTML
        setValue(html)
        onChange?.(html)
      }
    }
  }

  const handleInput = () => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    setValue(html)
    onChange?.(html)
  }

  return (
    <div className='space-y-2'>
      <div className='inline-flex flex-wrap gap-1 rounded-md border bg-muted px-1 py-1'>
        <button
          type='button'
          className='rounded px-2 py-0.5 text-[11px] hover:bg-background'
          onClick={() => handleCommand('bold')}
        >
          B
        </button>
        <button
          type='button'
          className='rounded px-2 py-0.5 text-[11px] italic hover:bg-background'
          onClick={() => handleCommand('italic')}
        >
          I
        </button>
        <button
          type='button'
          className='rounded px-2 py-0.5 text-[11px] underline hover:bg-background'
          onClick={() => handleCommand('underline')}
        >
          U
        </button>
        <button
          type='button'
          className='rounded px-2 py-0.5 text-[11px] hover:bg-background'
          onClick={() => handleCommand('insertUnorderedList')}
        >
          • List
        </button>
        <button
          type='button'
          className='rounded px-2 py-0.5 text-[11px] hover:bg-background'
          onClick={() => handleCommand('insertOrderedList')}
        >
          1. List
        </button>
      </div>

      <div
        ref={editorRef}
        className='min-h-[160px] rounded-md border bg-background px-3 py-2 text-xs outline-none'
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  )
}


