import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type StoreProduct } from '../data/schema'

type StoreProductsDialogType = 'create' | 'update' | 'delete' | 'import'

type StoreProductsContextType = {
  open: StoreProductsDialogType | null
  setOpen: (str: StoreProductsDialogType | null) => void
  currentRow: StoreProduct | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StoreProduct | null>>
}

const StoreProductsContext = React.createContext<StoreProductsContextType | null>(null)

export function StoreProductsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StoreProductsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StoreProduct | null>(null)

  return (
    <StoreProductsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StoreProductsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStoreProducts = () => {
  const storeProductsContext = React.useContext(StoreProductsContext)

  if (!storeProductsContext) {
    throw new Error('useStoreProducts has to be used within <StoreProductsContext>')
  }

  return storeProductsContext
}

