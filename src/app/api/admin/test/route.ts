import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET() {
  try {
    // year_entriesテーブルの存在確認（データを取得してみる）
    let yearEntriesTableExists = false
    let yearEntriesCount = 0
    let yearEntriesData = []
    
    try {
      const { data, error, count } = await supabaseAdmin
        .from('year_entries')
        .select('*', { count: 'exact' })
        .limit(5)

      if (!error) {
        yearEntriesTableExists = true
        yearEntriesCount = count || 0
        yearEntriesData = data || []
      }
    } catch (error) {
      yearEntriesTableExists = false
    }

    // admin_usersテーブルの存在確認（データを取得してみる）
    let adminUsersTableExists = false
    let adminUsersCount = 0
    let adminUsersData = []
    
    try {
      const { data, error, count } = await supabaseAdmin
        .from('admin_users')
        .select('*', { count: 'exact' })

      if (!error) {
        adminUsersTableExists = true
        adminUsersCount = count || 0
        adminUsersData = data || []
      }
    } catch (error) {
      adminUsersTableExists = false
    }


    return NextResponse.json({
      yearEntriesTableExists,
      adminUsersTableExists,
      yearEntriesCount,
      yearEntriesData: yearEntriesData.slice(0, 2), // 最初の2件のみ表示
      adminUsersCount,
      adminUsersData: adminUsersData.map(user => ({
        id: user.id,
        role: user.role,
        created_at: user.created_at
        // password_hashは除外
      }))
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
