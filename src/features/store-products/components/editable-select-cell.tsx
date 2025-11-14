import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type EditableSelectCellProps = {
  value: string | null
  options: string[]
  placeholder?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function EditableSelectCell({
  value,
  options,
  placeholder,
  onValueChange,
  className,
}: EditableSelectCellProps) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <Select value={localValue} onValueChange={handleChange}>
      <SelectTrigger className={className || 'h-8 w-[120px] text-xs'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

