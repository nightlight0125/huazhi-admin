/**
 * 后端第三方支付统一约定：同一套接口，凭 payType 区分渠道。
 * 适用于订单 requestPayment、钱包 requestWalletPayment、商品 buyProduct 等。
 */
export const THIRD_PARTY_PAY_TYPE_STRIPE = 0
export const THIRD_PARTY_PAY_TYPE_PAYPAL = 1

export type OrderPayDialogMethod = 'credit_card' | 'airwallex'

export function payTypeForOrderDialogMethod(
  method: OrderPayDialogMethod
): typeof THIRD_PARTY_PAY_TYPE_STRIPE | typeof THIRD_PARTY_PAY_TYPE_PAYPAL {
  return method === 'credit_card'
    ? THIRD_PARTY_PAY_TYPE_STRIPE
    : THIRD_PARTY_PAY_TYPE_PAYPAL
}

/** 钱包充值卡片：Stripe / PayPal */
export function payTypeForWalletTopupMethod(
  method: string | null
): typeof THIRD_PARTY_PAY_TYPE_STRIPE | typeof THIRD_PARTY_PAY_TYPE_PAYPAL {
  return method === 'bank-transfer-detailed'
    ? THIRD_PARTY_PAY_TYPE_PAYPAL
    : THIRD_PARTY_PAY_TYPE_STRIPE
}
