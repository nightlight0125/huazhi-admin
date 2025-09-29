import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { countryOptions, shippingMethodsByCountry, type ShippingMethod } from '../data/data'
import { type ProductConnection } from '../data/schema'

interface ShippingMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productConnection: ProductConnection | null
  onSave: (productId: string, newShippingMethod: string, newShippingCost: number) => void
}

export function ShippingMethodDialog({
  open,
  onOpenChange,
  productConnection,
  onSave,
}: ShippingMethodDialogProps) {
  const [selectedCountry, setSelectedCountry] = useState('uk')
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null)
  const [availableMethods, setAvailableMethods] = useState<ShippingMethod[]>([])

  // 当选择国家时，更新可用的运输方式
  useEffect(() => {
    if (selectedCountry) {
      setAvailableMethods(shippingMethodsByCountry[selectedCountry] || [])
      setSelectedShippingMethod(null) // 重置选择的运输方式
    }
  }, [selectedCountry])

  const handleSave = () => {
    if (productConnection && selectedShippingMethod) {
      onSave(productConnection.id, selectedShippingMethod.id, selectedShippingMethod.fee)
      onOpenChange(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && productConnection) {
      setSelectedCountry('uk') // 默认选择英国
      setSelectedShippingMethod(null)
    }
    onOpenChange(newOpen)
  }

  const handleSelectMethod = (method: ShippingMethod) => {
    setSelectedShippingMethod(method)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>可用的运输方式</DialogTitle>
          <DialogDescription>
            为产品 "{productConnection?.productName}" 选择运输方式
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 py-4'>
          {/* 国家选择 */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>按国家计算您的运费</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='请选择国家' />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 运输方式表格 */}
          {availableMethods.length > 0 && (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>以下是可供您选择的运输方式</label>
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-purple-50'>
                      <TableHead className='text-purple-700'>装运方式</TableHead>
                      <TableHead className='text-purple-700'>预计交货时间</TableHead>
                      <TableHead className='text-purple-700'>运费</TableHead>
                      <TableHead className='text-purple-700'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableMethods.map((method) => (
                      <TableRow 
                        key={method.id}
                        className={selectedShippingMethod?.id === method.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell className='font-medium'>{method.name}</TableCell>
                        <TableCell>{method.estimatedDays} 天</TableCell>
                        <TableCell className='font-medium'>${method.fee.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant={selectedShippingMethod?.id === method.id ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => handleSelectMethod(method)}
                          >
                            {selectedShippingMethod?.id === method.id ? '已选择' : '选择'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* 选择摘要 */}
          {selectedShippingMethod && (
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h4 className='font-medium text-blue-900 mb-2'>已选择的运输方式</h4>
              <div className='text-sm text-blue-700'>
                <p><strong>装运方式:</strong> {selectedShippingMethod.name}</p>
                <p><strong>预计交货时间:</strong> {selectedShippingMethod.estimatedDays} 天</p>
                <p><strong>运费:</strong> ${selectedShippingMethod.fee.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedShippingMethod}
          >
            确认选择
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
