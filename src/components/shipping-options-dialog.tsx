import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ShippingOption {
  id: string
  name: string
  estimatedDays: string
  price: number
}

interface ShippingOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultFrom?: string
  defaultTo?: string
  defaultQuantity?: number
  shippingOptions?: ShippingOption[]
  onSelect?: (optionId: string) => void
}

const defaultShippingOptions: ShippingOption[] = [
  {
    id: 'ds-economy',
    name: 'DS Economy line',
    estimatedDays: '9 - 12 Day',
    price: 7.76,
  },
  {
    id: 'ds-standard',
    name: 'DS Standard line',
    estimatedDays: '6 - 10 Day',
    price: 10.09,
  },
  {
    id: 'ds-standard-sensitive',
    name: 'DS Standard Sensitive line',
    estimatedDays: '7 - 9 Day',
    price: 15.67,
  },
]

export function ShippingOptionsDialog({
  open,
  onOpenChange,
  defaultFrom = 'Hangzhou',
  defaultTo = 'France',
  defaultQuantity = 1,
  shippingOptions = defaultShippingOptions,
  onSelect,
}: ShippingOptionsDialogProps) {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId)
    onSelect?.(optionId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Select Shipping Method</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* 顶部三个输入框 */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>From</label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Hangzhou'>Hangzhou</SelectItem>
                  <SelectItem value='Shanghai'>Shanghai</SelectItem>
                  <SelectItem value='Beijing'>Beijing</SelectItem>
                  <SelectItem value='Guangzhou'>Guangzhou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>To</label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='France'>France</SelectItem>
                  <SelectItem value='United States'>United States</SelectItem>
                  <SelectItem value='United Kingdom'>United Kingdom</SelectItem>
                  <SelectItem value='Germany'>Germany</SelectItem>
                  <SelectItem value='Canada'>Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Quantity</label>
              <Input
                type='number'
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 物流方式列表 */}
          <div className='space-y-2'>
            {shippingOptions.map((option) => (
              <div
                key={option.id}
                className='flex items-center gap-3 rounded-md border p-3 hover:bg-gray-50'
              >
                <Checkbox
                  checked={selectedOptionId === option.id}
                  onCheckedChange={() => handleSelectOption(option.id)}
                />
                <div className='flex flex-1 items-center justify-between'>
                  <div className='flex-1'>
                    <div className='font-medium'>{option.name}</div>
                    <div className='text-sm text-gray-500'>
                      {option.estimatedDays}
                    </div>
                  </div>
                  <div className='text-lg font-semibold text-orange-500'>
                    ${option.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex justify-end gap-2 border-t pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedOptionId) {
                onSelect?.(selectedOptionId)
                onOpenChange(false)
              }
            }}
            disabled={!selectedOptionId}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

