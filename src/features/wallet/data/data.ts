import { AlertCircle, CheckCircle, Clock, CreditCard, FileText, XCircle } from 'lucide-react'

// 钱包记录类型选项
export const walletRecordTypes = [
  {
    label: 'Recharge Records',
    value: 'recharge',
    icon: CreditCard,
  },
  {
    label: 'Invoice Records',
    value: 'invoice',
    icon: FileText,
  },
] as const

// 钱包记录状态选项
export const walletRecordStatuses = [
  {
    label: 'Pending',
    value: 'pending',
    icon: Clock,
    variant: 'secondary' as const,
  },
  {
    label: 'Completed',
    value: 'completed',
    icon: CheckCircle,
    variant: 'default' as const,
  },
  {
    label: 'Failed',
    value: 'failed',
    icon: XCircle,
    variant: 'destructive' as const,
  },
  {
    label: 'Cancelled',
    value: 'cancelled',
    icon: AlertCircle,
    variant: 'outline' as const,
  },
] as const

// 支付方式选项
export const paymentMethods = [
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat' },
  { label: '银行卡', value: 'bank_card' },
  { label: 'PayPal', value: 'paypal' },
  { label: '信用卡', value: 'credit_card' },
] as const

// 客户选项（用于搜索）
export const customers = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' },
  { label: '钱七', value: 'qianqi' },
  { label: '孙八', value: 'sunba' },
  { label: '周九', value: 'zhoujiu' },
  { label: '吴十', value: 'wushi' },
] as const
