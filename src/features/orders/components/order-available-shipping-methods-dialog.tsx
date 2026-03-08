import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type FreightOption } from '@/lib/api/logistics'
import { type Order } from '../data/schema'

interface OrderAvailableShippingMethodsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  shippingOptions: FreightOption[]
  isLoading?: boolean
  onSelect: (
    orderId: string,
    method: FreightOption
  ) => void | Promise<void>
}

export function OrderAvailableShippingMethodsDialog({
  open,
  onOpenChange,
  order,
  shippingOptions,
  isLoading = false,
  onSelect,
}: OrderAvailableShippingMethodsDialogProps) {
  const handleOk = async (method: FreightOption) => {
    if (!order) return
    await onSelect(order.id, method)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-[calc(100%-2rem)] sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Available shipping methods</DialogTitle>
          <p className='text-sm text-orange-500'>
            Below are the available shipping methods for your option
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className='text-muted-foreground flex items-center justify-center py-8 text-sm'>
            Loading shipping methods...
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead>Shipping Method</TableHead>
                  <TableHead>Estimated Delivery Time</TableHead>
                  <TableHead>Shipping Cost</TableHead>
                  <TableHead className='w-[100px]'>Operation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippingOptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-muted-foreground py-6 text-center'
                    >
                      No shipping methods available
                    </TableCell>
                  </TableRow>
                ) : (
                  shippingOptions.map((method) => (
                    <TableRow key={method.logsId}>
                      <TableCell className='font-medium'>
                        {method.logsNumber ?? '—'}
                      </TableCell>
                      <TableCell>{method.time ?? '—'}</TableCell>
                      <TableCell>
                        {typeof method.freight === 'number'
                          ? `$${method.freight.toFixed(2)}`
                          : String(method.freight ?? '—')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          className='bg-orange-500 hover:bg-orange-600'
                          onClick={() => handleOk(method)}
                        >
                          OK
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
