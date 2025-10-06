import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // 管理者ユーザーを取得
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // パスワードをチェック
    if (data.password_hash === password) {
      // パスワードを除いてユーザー情報を返す
      const { password_hash, ...userWithoutPassword } = data
      return NextResponse.json({ user: userWithoutPassword })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
