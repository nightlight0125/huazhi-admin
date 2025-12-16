import CryptoJS from 'crypto-js'

// 密码加密盐值
const PASSWORD_SALT = 'hzkj@G8xZ#pT1qW9!sL4fR7^vC2nH6*jD0kM'

/**
 * 加密密码
 * 匹配后端 Java 的 doMd5WithSalt 方法实现
 * 流程：password + salt → MD5 → 转大写
 * @param password 原始密码
 * @returns MD5 加密后的密码（32位大写）
 */
export function encryptPassword(password: string): string {
  // 1. 拼接盐值（和后端一致：s + salt，不转大写）
  const passwordWithSalt = password + PASSWORD_SALT
  // 2. MD5 加密（对原始拼接字符串进行MD5）
  const md5Hash = CryptoJS.MD5(passwordWithSalt).toString()
  // 3. 转为大写（匹配后端 doMd5 返回的大写格式）
  const md5HashUpper = md5Hash.toUpperCase()
  
  console.log('passwordWithSalt:', passwordWithSalt)
  console.log('MD5 (小写):', md5Hash)
  console.log('MD5 (大写，最终):', md5HashUpper)
  
  return md5HashUpper
}

