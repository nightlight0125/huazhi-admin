/**
 * Lucide Trash2 作为删除：默认灰、悬停红。
 * 父级带 `group` 时，悬停整块区域也会变红。
 */
export const TRASH_DELETE_ICON_CLASS =
  'text-gray-500 transition-colors hover:text-red-500 group-hover:text-red-500'

/** 用于 `variant="destructive"` 实心按钮内，保证对比度；悬停略提亮 */
export const TRASH_DELETE_DESTRUCTIVE_ICON_CLASS =
  'text-destructive-foreground/85 transition-colors hover:text-destructive-foreground group-hover:text-destructive-foreground'

/** 带 `border-destructive` 且悬停铺满红色的按钮：图标默认灰，悬停按钮时随前景色（多为白） */
export const TRASH_DELETE_OUTLINE_DESTRUCTIVE_ICON_CLASS =
  'text-gray-500 transition-colors group-hover:text-destructive-foreground'
