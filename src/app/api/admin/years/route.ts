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

// 年度情報一覧取得
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('year_entries')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch years', details: error.message },
        { status: 500 }
      )
    }

    // レスポンスをAPI形式に変換
    const responseData = (data || []).map(entry => ({
      id: entry.id,
      year: entry.year,
      band: entry.band,
      prize: entry.prize,
      soloPrize: entry.solo_prize,
      imagePath: entry.image_path,
      musics: entry.musics,
      url1: entry.url1,
      url2: entry.url2,
      members: entry.members,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    }))

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('GET years error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 年度情報作成
export async function POST(request: NextRequest) {
  try {
    const entry = await request.json()

    // フィールド名をデータベーススキーマに合わせて変換
    const dbEntry = {
      year: entry.year,
      band: entry.band,
      prize: entry.prize,
      solo_prize: entry.soloPrize,
      image_path: entry.imagePath,
      musics: entry.musics || [],
      url1: entry.url1,
      url2: entry.url2,
      members: entry.members || []
    }

    console.log('Creating year entry:', dbEntry)

    const { data, error } = await supabaseAdmin
      .from('year_entries')
      .insert([dbEntry])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create year entry', details: error.message },
        { status: 500 }
      )
    }

    // レスポンスをAPI形式に変換
    const responseData = {
      id: data.id,
      year: data.year,
      band: data.band,
      prize: data.prize,
      soloPrize: data.solo_prize,
      imagePath: data.image_path,
      musics: data.musics,
      url1: data.url1,
      url2: data.url2,
      members: data.members,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('POST years error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
