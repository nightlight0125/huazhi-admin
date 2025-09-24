import { CreditCard, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// 钱包记录类型选项
export const walletRecordTypes = [
  {
    label: '充值记录',
    value: 'recharge',
    icon: CreditCard,
  },
  {
    label: '发票记录',
    value: 'invoice',
    icon: FileText,
  },
] as const

// 钱包记录状态选项
export const walletRecordStatuses = [
  {
    label: '待处理',
    value: 'pending',
    icon: Clock,
    variant: 'secondary' as const,
  },
  {
    label: '已完成',
    value: 'completed',
    icon: CheckCircle,
    variant: 'default' as const,
  },
  {
    label: '失败',
    value: 'failed',
    icon: XCircle,
    variant: 'destructive' as const,
  },
  {
    label: '已取消',
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
