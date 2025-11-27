import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type StockOrder } from '../data/schema'

type StockOrdersDialogType = 'create' | 'update' | 'delete' | 'import' | 'sync'

type StockOrdersContextType = {
  open: StockOrdersDialogType | null
  setOpen: (str: StockOrdersDialogType | null) => void
  currentRow: StockOrder | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockOrder | null>>
}

const StockOrdersContext = React.createContext<StockOrdersContextType | null>(null)

export function StockOrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StockOrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockOrder | null>(null)

  return (
    <StockOrdersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StockOrdersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStockOrders = () => {
  const stockOrdersContext = React.useContext(StockOrdersContext)

  if (!stockOrdersContext) {
    throw new Error('useStockOrders has to be used within <StockOrdersContext>')
  }

  return stockOrdersContext
}

