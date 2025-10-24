import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseJsonSafely, parseArraySafely } from '@/lib/json-utils'

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
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
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
      musics: parseArraySafely(parseJsonSafely(entry.musics) || []),
      url1: entry.url1,
      url2: entry.url2,
      members: parseArraySafely(parseJsonSafely(entry.members) || []),
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
    // SupabaseのJSONBフィールドには直接配列を渡す
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
    console.log('Musics data type:', typeof dbEntry.musics, dbEntry.musics)

    // JSONBフィールドを明示的に処理（Supabaseでは直接配列を渡す）
    const insertData = {
      ...dbEntry
    }

    console.log('Insert data:', insertData)

    // SupabaseのREST APIを直接使用してJSONBフィールドを適切に処理
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation'
    }
    
    if (supabaseServiceKey) {
      headers['apikey'] = supabaseServiceKey
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/year_entries`, {
      method: 'POST',
      headers,
      body: JSON.stringify(insertData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Supabase REST API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    const singleData = Array.isArray(data) ? data[0] : data

    // レスポンスをAPI形式に変換
    const responseData = {
      id: singleData.id,
      year: singleData.year,
      band: singleData.band,
      prize: singleData.prize,
      soloPrize: singleData.solo_prize,
      imagePath: singleData.image_path,
      musics: parseArraySafely(parseJsonSafely(singleData.musics) || []),
      url1: singleData.url1,
      url2: singleData.url2,
      members: parseArraySafely(parseJsonSafely(singleData.members) || []),
      created_at: singleData.created_at,
      updated_at: singleData.updated_at
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
