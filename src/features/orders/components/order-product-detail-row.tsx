import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type OrderProduct } from '../data/schema'

/** 订单展开行：Store/HZ 双行、Shopify·Variant·SKU·Price·Quantity，与普通订单表格共用 */
export function OrderProductDetailRow({
  product,
  onModifyProduct,
  orderId,
  orderNumber,
  onDeleteLine,
  orderStatus,
}: {
  product: OrderProduct
  onModifyProduct?: () => void
  orderId: string
  orderNumber?: string
  onDeleteLine?: (
    orderId: string,
    lineItem: OrderProduct
  ) => void | Promise<void>
  orderStatus?: string
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const normalizedStatus = String(orderStatus ?? '').toLowerCase()
  const isPaidOrder = normalizedStatus === '2'

  const handleDeleteClick = () => {
    if (isPaidOrder) {
      toast.error('Paid orders are not allowed to be deleted.')
      return
    }
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!onDeleteLine) return

    setIsDeleting(true)
    try {
      await onDeleteLine(orderId, product)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('删除订单明细失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const isModifyDisabled = orderStatus === '2'
  const fieldLabels = ['Shopify', 'SKU', 'Price', 'Quantity']
  const leftButtons = ['Store', 'HZ']
  const rightButtons: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
    tooltip?: string
  }> = [
    {
      label: 'Modify Product',
      onClick: onModifyProduct || (() => {}),
      disabled: isModifyDisabled,
      tooltip: isModifyDisabled ? 'No local matching SKU' : undefined,
    },
    {
      label: 'Delete',
      onClick: handleDeleteClick,
      disabled: isPaidOrder,
      tooltip: isPaidOrder
        ? 'Paid orders are not allowed to be deleted.'
        : undefined,
    },
  ]

  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return '---'
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (!isNaN(numValue) && isFinite(numValue)) {
      return numValue.toFixed(2)
    }
    return String(value)
  }

  const shopifyVariantLabel = String(product?.hzkj_variant_name ?? '').trim()

  const variantProductNameEnGl = (() => {
    const raw = (
      product as OrderProduct & {
        hzkj_product_name_en?: { GLang?: string } | string
      }
    )?.hzkj_product_name_en
    if (raw == null || raw === '') return ''
    if (typeof raw === 'string') return raw.trim()
    return String(raw.GLang ?? '').trim()
  })()

  return (
    <React.Fragment>
      <TableRow className='bg-muted/30'>
        <TableCell colSpan={100} className='px-3 py-2'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex items-start gap-2'>
              <div>
                <img
                  src={product?.hzkj_picture || ''}
                  alt={
                    shopifyVariantLabel || variantProductNameEnGl || 'Product'
                  }
                  className='h-12 w-12 rounded object-cover'
                />
              </div>
              <div className='flex flex-col gap-2'>
                {leftButtons.map((buttonLabel, buttonIndex) => (
                  <div key={buttonLabel} className='flex items-center gap-2'>
                    {fieldLabels.map((label, index) => (
                      <React.Fragment key={`${buttonLabel}-${label}`}>
                        {index === 1 && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-5 w-16 text-[11px]'
                          >
                            {buttonLabel}
                          </Button>
                        )}
                        <div
                          style={{ width: '220px', wordBreak: 'break-all' }}
                          className='min-w-0 text-[12px]'
                        >
                          {index === 0 ? (
                            buttonIndex === 0 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className='cursor-default truncate'>
                                    {`Shopify:${shopifyVariantLabel}`}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent
                                  side='top'
                                  align='start'
                                  className='max-w-sm text-xs break-words'
                                >
                                  {`Shopify:${shopifyVariantLabel}`}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className='max-w-full cursor-default truncate'>
                                    {`Variant: ${variantProductNameEnGl || '---'}`}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent
                                  side='top'
                                  align='start'
                                  className='max-w-sm text-xs break-words'
                                >
                                  {`Variant: ${variantProductNameEnGl || '---'}`}
                                </TooltipContent>
                              </Tooltip>
                            )
                          ) : index === 1 ? (
                            buttonIndex === 0 ? (
                              `SKU:${product?.hzkj_shop_sku || '---'}`
                            ) : (
                              `SKU:${product?.hzkj_local_sku || '---'}`
                            )
                          ) : index === 2 ? (
                            buttonIndex === 0 ? (
                              `Price:${formatValue(product?.hzkj_shop_price)}`
                            ) : (
                              `Price:${formatValue(
                                product?.hzkj_unit_sett_price ?? 0
                              )}`
                            )
                          ) : index === 3 ? (
                            buttonIndex === 0 ? (
                              `Quantity:${formatValue(product?.hzkj_src_qty)}`
                            ) : (
                              `Quantity:${formatValue(product?.hzkj_qty)}`
                            )
                          ) : (
                            `${label}:---`
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              {rightButtons.map((button) => {
                const btn = (
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-5 text-[11px]'
                    onClick={button.disabled ? undefined : button.onClick}
                    disabled={button.disabled}
                  >
                    {button.label}
                  </Button>
                )
                return button.tooltip && button.disabled ? (
                  <Tooltip key={button.label}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent>{button.tooltip}</TooltipContent>
                  </Tooltip>
                ) : (
                  <React.Fragment key={button.label}>{btn}</React.Fragment>
                )
              })}
            </div>
          </div>
        </TableCell>
      </TableRow>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(newOpen) => {
          if (!isDeleting) {
            setDeleteDialogOpen(newOpen)
          }
        }}
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={isDeleting}
        title={<span className='text-destructive'>Delete line item</span>}
        desc={
          <>
            <p className='mb-2'>
              Remove this product line from the order?
              <br />
              This action cannot be undone.
            </p>
            {orderNumber && (
              <p className='text-muted-foreground text-sm'>
                Order Number: <strong>{orderNumber}</strong>
              </p>
            )}
          </>
        }
        confirmText={
          isDeleting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Deleting...
            </>
          ) : (
            'Delete'
          )
        }
      />
    </React.Fragment>
  )
}
