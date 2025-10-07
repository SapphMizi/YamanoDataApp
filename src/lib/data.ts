// データ型定義をインポート
import { YearEntry as YamanoHistoryEntry, Member, Music } from './types';

// データ型の再エクスポート
export type { Member, Music };
export type { YamanoHistoryEntry };

export interface YamanoHistoryData {
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

// 楽器名の正規化マップ
const instrumentMap: { [key: string]: string } = {
  'ASx': 'Alto Saxophone',
  'Asx': 'Alto Saxophone',
  'TSx': 'Tenor Saxophone',
  'Tsx': 'Tenor Saxophone',
  'BSx': 'Baritone Saxophone',
  'Bsx': 'Baritone Saxophone',
  'Tp': 'Trumpet',
  'Tb': 'Trombone',
  'BTb': 'Bass Trombone',
  'P': 'Piano',
  'Pf': 'Piano',
  'B': 'Bass',
  'G': 'Guitar',
  'D': 'Drums',
  'Ds': 'Drums',
  'Vo': 'Vocal',
  'MC': 'MC',
  'Cl': 'Clarinet'
};

// 楽器名を正規化
export function normalizeInstrument(instrument: string): string {
  return instrumentMap[instrument] || instrument;
}

// 楽器記号の意味
export function getInstrumentSymbols(symbols: string): string[] {
  const meanings: { [key: string]: string } = {
    '★': 'リーダー',
    '◆': 'サブリーダー',
    '●': 'セクションリーダー',
    '◎': '特別メンバー'
  };
  
  return symbols.split('').map(s => meanings[s] || s);
}

// データを取得する関数（実際の実装では、APIやファイルから読み込む）
export async function getYamanoHistoryData(): Promise<YamanoHistoryData> {
  // ここでは静的なデータを返す（実際の実装では、CSVファイルやAPIから読み込む）
  return {
    stats: {
      totalYears: 45,
      yearRange: {
        start: 1980,
        end: 2024
      },
      bands: [
        'The New Wave Jazz Orchestra',
        '日本E軍 Monkey Club Jazz Orchestra'
      ],
      totalMusics: 162,
      totalMembers: 830
    },
    data: []
  };
}

// 年でフィルタリング
export function filterByYear(data: YamanoHistoryEntry[], year: number): YamanoHistoryEntry[] {
  return data.filter(entry => entry.year === year);
}

// 年範囲でフィルタリング
export function filterByYearRange(data: YamanoHistoryEntry[], startYear: number, endYear: number): YamanoHistoryEntry[] {
  return data.filter(entry => entry.year >= startYear && entry.year <= endYear);
}

// バンドでフィルタリング
export function filterByBand(data: YamanoHistoryEntry[], band: string): YamanoHistoryEntry[] {
  return data.filter(entry => entry.band === band);
}

// 楽器でフィルタリング
export function filterByInstrument(data: YamanoHistoryEntry[], instrument: string): YamanoHistoryEntry[] {
  return data.filter(entry => 
    entry.members.some(member => 
      member.instrument === instrument || normalizeInstrument(member.instrument) === instrument
    )
  );
}
