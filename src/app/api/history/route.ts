import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Music } from '@/lib/types';

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

interface Member {
  symbols: string;
  instrument: string;
  name: string;
  university: string;
}

interface YamanoHistoryEntry {
  year: number;
  band: string;
  prize: string;
  soloPrize: string;
  imagePath: string;
  musics: Music[];
  url1: string;
  url2: string;
  members: Member[];
}

interface YamanoHistoryData {
  stats: {
    totalYears: number;
    yearRange: {
      start: number;
      end: number;
    };
    bands: string[];
    totalMusics: number;
    totalMembers: number;
  };
  data: YamanoHistoryEntry[];
}

export async function GET() {
  try {
    // データベースから年度情報を取得
    const { data: entries, error } = await supabaseAdmin
      .from('year_entries')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data from database', details: error.message },
        { status: 500 }
      )
    }

    // データを変換
    const historyEntries: YamanoHistoryEntry[] = (entries || []).map(entry => {
      // musicsの互換性処理（旧形式の文字列配列から新形式へ変換）
      let musics: Music[] = [];
      if (entry.musics) {
        try {
          // JSONBフィールドから取得したデータの処理
          let musicsData = entry.musics;
          if (typeof musicsData === 'string') {
            try {
              musicsData = JSON.parse(musicsData);
            } catch (parseError) {
              console.error('Failed to parse musics JSON:', parseError);
              musicsData = [];
            }
          }
          
          if (Array.isArray(musicsData) && musicsData.length > 0) {
            musics = musicsData.map((musicItem: any) => {
              if (typeof musicItem === 'string') {
                // 旧形式の文字列の場合、新形式に変換
                return {
                  title: musicItem,
                  soloists: []
                };
              } else if (musicItem && typeof musicItem === 'object') {
                // 新形式のオブジェクトの場合、安全に処理
                return {
                  title: musicItem.title || '',
                  soloists: Array.isArray(musicItem.soloists) ? musicItem.soloists : []
                };
              } else {
                // 予期しない形式の場合
                console.warn('Unexpected music item format:', musicItem);
                return {
                  title: String(musicItem) || '',
                  soloists: []
                };
              }
            });
          }
        } catch (error) {
          console.error('Error processing musics data for entry:', entry.id, error);
          musics = [];
        }
      }
      
      return {
        year: entry.year,
        band: entry.band,
        prize: entry.prize || '',
        soloPrize: entry.solo_prize || '',
        imagePath: entry.image_path || '',
        musics,
        url1: entry.url1 || '',
        url2: entry.url2 || '',
        members: typeof entry.members === 'string' ? JSON.parse(entry.members) : (entry.members || [])
      };
    })

    // 統計情報を計算
    const years = historyEntries.map(entry => entry.year)
    const bands = [...new Set(historyEntries.map(entry => entry.band))]
    const totalMusics = historyEntries.reduce((sum, entry) => sum + entry.musics.length, 0)
    const totalMembers = historyEntries.reduce((sum, entry) => sum + entry.members.length, 0)

    const result: YamanoHistoryData = {
      stats: {
        totalYears: historyEntries.length,
        yearRange: {
          start: years.length > 0 ? Math.min(...years) : 1980,
          end: years.length > 0 ? Math.max(...years) : 2024
        },
        bands: bands.sort(),
        totalMusics,
        totalMembers
      },
      data: historyEntries
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error serving history data:', error);
    return NextResponse.json(
      { error: 'Failed to process data' },
      { status: 500 }
    );
  }
}
