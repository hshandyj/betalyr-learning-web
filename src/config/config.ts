// API 配置
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL
}

// 获取环境
export function getEnv() {
  return process.env.NEXT_PUBLIC_ENV
}

// 获取业务ID
export function getBusinessId() {
  return process.env.NEXT_PUBLIC_BUSINESS_ID
}

// Firebase配置
export function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
}

// 其他配置
export function getS3Host() {
  return process.env.NEXT_PUBLIC_AWS_S3_BASE_URL
}

export function getApiKey() {
  return process.env.NEXT_PUBLIC_API_KEY
}

export function getPaypalClientId() {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
}