import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function HelpButton() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <HelpCircle className='size-[1.2rem]' />
          <span className='sr-only'>Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem>Help Center</DropdownMenuItem>
        <DropdownMenuItem>Documentation</DropdownMenuItem>
        <DropdownMenuItem>Contact Support</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

