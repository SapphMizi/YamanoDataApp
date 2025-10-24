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
  }
})

// 年度情報取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('year_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Year entry not found', details: error.message },
        { status: 404 }
      )
    }


    console.log('Raw data from database:', data)
    console.log('Musics type:', typeof data.musics, 'Value:', data.musics)
    console.log('Members type:', typeof data.members, 'Value:', data.members)

    // レスポンスをAPI形式に変換
    const parsedMusics = parseArraySafely(parseJsonSafely(data.musics) || [])
    const parsedMembers = parseArraySafely(parseJsonSafely(data.members) || [])
    
    console.log('Final parsed musics:', parsedMusics)
    console.log('Final parsed members:', parsedMembers)
    
    const responseData = {
      id: data.id,
      year: data.year,
      band: data.band,
      prize: data.prize,
      soloPrize: data.solo_prize,
      imagePath: data.image_path,
      musics: parsedMusics,
      url1: data.url1,
      url2: data.url2,
      members: parsedMembers,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('GET year error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 年度情報更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    console.log('Updating year entry:', dbEntry)

    // JSONBフィールドを明示的に処理（Supabaseでは直接配列を渡す）
    const updateData = {
      ...dbEntry
    }

    console.log('Update data:', updateData)

    // SupabaseのREST APIを直接使用してJSONBフィールドを適切に処理
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation'
    }
    
    if (supabaseServiceKey) {
      headers['apikey'] = supabaseServiceKey
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/year_entries?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Supabase REST API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    const singleData = Array.isArray(data) ? data[0] : data

    console.log('PUT response data:', singleData)
    console.log('PUT musics type:', typeof singleData.musics, 'Value:', singleData.musics)
    console.log('PUT members type:', typeof singleData.members, 'Value:', singleData.members)

    // レスポンスをAPI形式に変換
    const parsedMusics = parseArraySafely(parseJsonSafely(singleData.musics) || [])
    const parsedMembers = parseArraySafely(parseJsonSafely(singleData.members) || [])
    
    console.log('PUT final parsed musics:', parsedMusics)
    console.log('PUT final parsed members:', parsedMembers)
    
    const responseData = {
      id: singleData.id,
      year: singleData.year,
      band: singleData.band,
      prize: singleData.prize,
      soloPrize: singleData.solo_prize,
      imagePath: singleData.image_path,
      musics: parsedMusics,
      url1: singleData.url1,
      url2: singleData.url2,
      members: parsedMembers,
      created_at: singleData.created_at,
      updated_at: singleData.updated_at
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('PUT year error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 年度情報削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('year_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete year entry', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE year error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
