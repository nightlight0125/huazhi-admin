import { createContext, useContext, useState } from 'react'
import { type ProductConnection } from '../data/schema'

type DialogType = 'brand' | 'delete' | null

type ProductConnectionsContextType = {
  open: DialogType
  setOpen: (open: DialogType) => void
  currentRow: ProductConnection | null
  setCurrentRow: (row: ProductConnection | null) => void
}

const ProductConnectionsContext = createContext<ProductConnectionsContextType | undefined>(undefined)

export function ProductConnectionsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProductConnection | null>(null)

  return (
    <ProductConnectionsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
      }}
    >
      {children}
    </ProductConnectionsContext.Provider>
  )
}

export function useProductConnections() {
  const context = useContext(ProductConnectionsContext)
  if (context === undefined) {
    throw new Error('useProductConnections must be used within a ProductConnectionsProvider')
  }
  return context
}
