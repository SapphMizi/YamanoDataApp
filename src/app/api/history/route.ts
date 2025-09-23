import { NextResponse } from 'next/server';
import dataJson from '../../../data/yamano-history.json';

// データ型定義
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
  musics: string[];
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
    // ビルド時に取り込んだ静的JSONを返却
    const result = dataJson as YamanoHistoryData;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error serving history data:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV data' },
      { status: 500 }
    );
  }
}
