import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates page numbers for pagination with ellipsis
 * Format: [1] [2] [3] [4] [5] ... [last]
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤6 pages): show all
 * - Near beginning: [1, 2, 3, 4, 5, '...', 21]
 * - In middle: [1, '...', 4, 5, 6, 7, 8, '...', 21]
 * - Near end: [1, '...', 17, 18, 19, 20, 21]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisible = 5 // 显示 5 个页码，中间用 ... 省略
  const rangeWithDots: (number | '...')[] = []

  if (totalPages <= maxVisible + 1) {
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
    return rangeWithDots
  }

  if (currentPage <= 3) {
    // 靠近开头: [1] [2] [3] [4] [5] ... [21]
    for (let i = 1; i <= maxVisible; i++) {
      rangeWithDots.push(i)
    }
    rangeWithDots.push('...', totalPages)
  } else if (currentPage >= totalPages - 2) {
    // 靠近结尾: [1] ... [17] [18] [19] [20] [21]
    rangeWithDots.push(1, '...')
    for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // 中间: [1] ... [c-2] [c-1] [c] [c+1] [c+2] ... [21]
    rangeWithDots.push(1, '...')
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      rangeWithDots.push(i)
    }
    rangeWithDots.push('...', totalPages)
  }

  return rangeWithDots
}
