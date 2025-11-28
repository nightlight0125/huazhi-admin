import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

type PriceRange = {
  min: number
  max: number
}

type PriceRangePopoverProps = {
  value?: PriceRange
  onChange: (value: PriceRange | undefined) => void
  min?: number
  max?: number
  step?: number
}

export function PriceRangePopover({
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 10,
}: PriceRangePopoverProps) {
  const [open, setOpen] = useState(false)
  const [localMin, setLocalMin] = useState<number>(value?.min ?? min)
  const [localMax, setLocalMax] = useState<number>(value?.max ?? max)

  const clamp = (val: number) => Math.min(max, Math.max(min, val))

  const displayLabel =
    value && value.min !== min && value.max !== max
      ? `$${value.min} - $${value.max}`
      : 'Price range'

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setLocalMin(value?.min ?? min)
          setLocalMax(value?.max ?? max)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-8 min-w-[140px] justify-between border-dashed'
        >
          <span className='text-sm'>{displayLabel}</span>
          <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='bg-background w-[260px] rounded-xl border p-4 shadow-md'
      >
        <div className='space-y-4'>
          {/* 双滑块 */}
          <div className='relative h-6'>
            <div className='bg-muted absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full' />
            <div
              className='bg-primary absolute top-1/2 h-1 -translate-y-1/2 rounded-full'
              style={{
                left: `${((localMin - min) / (max - min)) * 100}%`,
                right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
              }}
            />
            <input
              type='range'
              min={min}
              max={max}
              step={step}
              value={localMin}
              onChange={(e) => {
                const next = clamp(Number(e.target.value))
                setLocalMin(Math.min(next, localMax))
              }}
              className='pointer-events-none absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary'
            />
            <input
              type='range'
              min={min}
              max={max}
              step={step}
              value={localMax}
              onChange={(e) => {
                const next = clamp(Number(e.target.value))
                setLocalMax(Math.max(next, localMin))
              }}
              className='pointer-events-none absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary'
            />
          </div>

          {/* 输入框 */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex-1 rounded-xl border px-3 py-2 text-xs'>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>$</span>
                <Input
                  type='number'
                  value={localMin}
                  onChange={(e) => {
                    const num = clamp(Number(e.target.value) || min)
                    setLocalMin(Math.min(num, localMax))
                  }}
                  className='h-6 border-0 p-0 text-xs focus-visible:ring-0'
                />
              </div>
            </div>
            <span className='text-muted-foreground text-xs'>-</span>
            <div className='flex-1 rounded-xl border px-3 py-2 text-xs'>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>$</span>
                <Input
                  type='number'
                  value={localMax}
                  onChange={(e) => {
                    const num = clamp(Number(e.target.value) || max)
                    setLocalMax(Math.max(num, localMin))
                  }}
                  className='h-6 border-0 p-0 text-xs focus-visible:ring-0'
                />
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className='mt-2 flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 flex-1 rounded-xl text-xs'
              onClick={() => {
                onChange(undefined)
                setLocalMin(min)
                setLocalMax(max)
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              size='sm'
              className='h-8 flex-1 rounded-xl text-xs'
              onClick={() => {
                onChange({ min: localMin, max: localMax })
                setOpen(false)
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


