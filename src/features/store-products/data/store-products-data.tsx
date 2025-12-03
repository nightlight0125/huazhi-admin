import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  Package,
} from 'lucide-react'

export const storeProductStatuses = [
  {
    label: 'Active',
    value: 'active' as const,
    icon: CheckCircle,
  },
  {
    label: 'Inactive',
    value: 'inactive' as const,
    icon: Circle,
  },
  {
    label: 'Out of Stock',
    value: 'out of stock' as const,
    icon: AlertCircle,
  },
  {
    label: 'Draft',
    value: 'draft' as const,
    icon: CircleOff,
  },
  {
    label: 'Archived',
    value: 'archived' as const,
    icon: Package,
  },
]

export const storeProductCategories = [
  {
    value: 'electronics',
    label: 'Electronics',
  },
  {
    value: 'clothing',
    label: 'Clothing',
  },
  {
    value: 'home',
    label: 'Home',
  },
  {
    value: 'sports',
    label: 'Sports',
  },
  {
    value: 'books',
    label: 'Books',
  },
]

export const storeProductPriorities = [
  {
    label: 'Low',
    value: 'low' as const,
    icon: ArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium' as const,
    icon: ArrowRight,
  },
  {
    label: 'High',
    value: 'high' as const,
    icon: ArrowUp,
  },
]
