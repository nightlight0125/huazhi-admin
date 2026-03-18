import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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

const SLIDER_UI_MAX = 999_999

export function PriceRangePopover({
  value,
  onChange,
  min = 0,
  max,
  step = 10,
}: PriceRangePopoverProps) {
  const effectiveMax = max ?? SLIDER_UI_MAX
  const [open, setOpen] = useState(false)
  const [localMin, setLocalMin] = useState<number>(value?.min ?? min)
  const [localMax, setLocalMax] = useState<number>(
    value?.max ?? max ?? SLIDER_UI_MAX
  )

  const clampMin = (val: number) => Math.max(min, val)
  const clampMax = (val: number) =>
    max != null ? Math.min(max, Math.max(min, val)) : Math.max(min, val)

  const displayLabel =
    value && (value.min !== min || value.max !== effectiveMax)
      ? `$${value.min} - $${value.max}`
      : 'Price range'

  // 滑块轨道视觉范围限制在 [min, effectiveMax]，避免输入超大数值时轨道溢出
  const visualMin = Math.min(Math.max(localMin, min), effectiveMax)
  const visualMax = Math.min(Math.max(localMax, min), effectiveMax)

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setLocalMin(value?.min ?? min)
          setLocalMax(value?.max ?? max ?? SLIDER_UI_MAX)
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
        className='bg-popover text-popover-foreground w-[240px] rounded-md border p-3 shadow-md'
      >
        <div className='space-y-4'>
          {/* 双滑块 */}
          <div className='relative h-6 overflow-hidden'>
            <div className='bg-muted absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full' />
            <div
              className='bg-primary absolute top-1/2 h-1 -translate-y-1/2 rounded-full'
              style={{
                left: `${((visualMin - min) / (effectiveMax - min)) * 100}%`,
                right: `${100 - ((visualMax - min) / (effectiveMax - min)) * 100}%`,
              }}
            />
            <input
              type='range'
              min={min}
              max={effectiveMax}
              step={step}
              value={localMin}
              onChange={(e) => {
                const next = clampMin(Number(e.target.value))
                setLocalMin(Math.min(next, localMax))
              }}
              className='[&::-webkit-slider-thumb]:bg-primary pointer-events-none absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full'
            />
            <input
              type='range'
              min={min}
              max={effectiveMax}
              step={step}
              value={localMax}
              onChange={(e) => {
                const next = clampMax(Number(e.target.value))
                setLocalMax(Math.max(next, localMin))
              }}
              className='[&::-webkit-slider-thumb]:bg-primary pointer-events-none absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full'
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
                    const num = clampMin(Number(e.target.value) || min)
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
                    const raw = Number(e.target.value)
                    const num = Number.isNaN(raw)
                      ? localMax
                      : clampMax(raw)
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
                setLocalMax(max ?? SLIDER_UI_MAX)
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
