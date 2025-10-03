import { createClient } from '@supabase/supabase-js'

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase environment variables:', {
  url: !!supabaseUrl,
  anonKey: !!supabaseAnonKey,
  urlValue: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'undefined'
})

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin用のクライアント（サービスロールキー使用）
// サーバーサイドでのみ利用可能
let supabaseAdmin: any = null

if (typeof window === 'undefined') {
  // サーバーサイドでのみ実行
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    console.log('Supabase admin client initialized on server')
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not available on server')
  }
} else {
  console.warn('Supabase admin client not available on client side')
}

export { supabaseAdmin }
