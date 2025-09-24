'use client'

import React, { createContext, useContext, useState } from 'react'
import { type Role } from '../data/schema'

type RolesDialogType = 'add' | 'edit' | 'delete'

type RolesContextType = {
  open: RolesDialogType | null
  setOpen: (open: RolesDialogType | null) => void
  currentRow: Role | null
  setCurrentRow: (row: Role | null) => void
}

const RolesContext = createContext<RolesContextType | null>(null)

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<RolesDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Role | null>(null)

  return (
    <RolesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
      }}
    >
      {children}
    </RolesContext.Provider>
  )
}

export function useRoles() {
  const context = useContext(RolesContext)
  if (!context) {
    throw new Error('useRoles has to be used within <RolesContext>')
  }
  return context
}
