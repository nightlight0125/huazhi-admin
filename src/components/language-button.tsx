import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageButton() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Globe className='size-[1.2rem]' />
          <span className='sr-only'>Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem>English</DropdownMenuItem>
        <DropdownMenuItem>中文</DropdownMenuItem>
        <DropdownMenuItem>日本語</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

