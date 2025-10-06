import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
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

    const { data, error } = await supabaseAdmin
      .from('year_entries')
      .update(dbEntry)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update year entry', details: error.message },
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
