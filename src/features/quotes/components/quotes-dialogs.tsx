import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { QuotesMutateDrawer } from './quotes-mutate-drawer'
import { useQuotes } from './quotes-provider'

export function QuotesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useQuotes()
  
  return (
    <>
      <QuotesMutateDrawer
        key='quote-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <QuotesMutateDrawer
            key={`quote-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='quote-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                '以下询价已被删除:'
              )
            }}
            className='max-w-md'
            title={`删除询价: ${currentRow.id} ?`}
            desc={
              <>
                您即将删除询价 <strong>{currentRow.id}</strong>。<br />
                此操作无法撤销。
              </>
            }
            confirmText='删除'
          />

          <ConfirmDialog
            key='quote-inquiry'
            open={open === 'inquiry'}
            onOpenChange={() => {
              setOpen('inquiry')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                '询价问询已发送:'
              )
            }}
            className='max-w-md'
            title={`发送问询: ${currentRow.productName} ?`}
            desc={
              <>
                您即将向供应商发送关于 <strong>{currentRow.productName}</strong> 的问询。<br />
                供应商将收到您的问询并尽快回复。
              </>
            }
            confirmText='发送问询'
          />
        </>
      )}
    </>
  )
}
