import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type SampleOrder } from '../data/schema'

type SampleOrdersDialogType = 'create' | 'update' | 'delete' | 'import' | 'sync'

type SampleOrdersContextType = {
  open: SampleOrdersDialogType | null
  setOpen: (str: SampleOrdersDialogType | null) => void
  currentRow: SampleOrder | null
  setCurrentRow: React.Dispatch<React.SetStateAction<SampleOrder | null>>
}

const SampleOrdersContext = React.createContext<SampleOrdersContextType | null>(null)

export function SampleOrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SampleOrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SampleOrder | null>(null)

  return (
    <SampleOrdersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SampleOrdersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSampleOrders = () => {
  const sampleOrdersContext = React.useContext(SampleOrdersContext)

  if (!sampleOrdersContext) {
    throw new Error('useSampleOrders has to be used within <SampleOrdersContext>')
  }

  return sampleOrdersContext
}

