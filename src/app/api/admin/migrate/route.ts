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
    const { action } = await request.json()

    if (action === 'migrate_from_json') {
      // JSONファイルからデータを読み込み
      const response = await fetch(`${request.nextUrl.origin}/history.json`)
      if (!response.ok) {
        return NextResponse.json({
          error: 'Failed to fetch JSON data'
        }, { status: 500 })
      }

      const jsonData = await response.json()
      const entries = jsonData.data || []

      if (entries.length === 0) {
        return NextResponse.json({
          error: 'No data found in JSON file'
        }, { status: 400 })
      }

      // データを変換してデータベースに挿入
      const formattedEntries = entries.map((entry: any) => ({
        year: entry.year,
        band: entry.band,
        prize: entry.prize || null,
        solo_prize: entry.soloPrize || null,
        image_path: entry.imagePath || null,
        musics: entry.musics || [],
        url1: entry.url1 || null,
        url2: entry.url2 || null,
        members: entry.members || []
      }))

      // 既存のデータをすべて削除してから新しいデータを挿入
      const { error: deleteError } = await supabaseAdmin
        .from('year_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // すべてのレコードを削除

      if (deleteError) {
        console.error('Delete error:', deleteError)
      }

      // 新しいデータを挿入
      const { data, error } = await supabaseAdmin
        .from('year_entries')
        .insert(formattedEntries)
        .select()

      if (error) {
        return NextResponse.json({
          error: 'Failed to migrate data',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully migrated ${data?.length || 0} entries`,
        data: data?.slice(0, 5) // 最初の5件のみ返す
      })
    }

    return NextResponse.json({
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
