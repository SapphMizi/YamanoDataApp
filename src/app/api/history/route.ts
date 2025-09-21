import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

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

// CSVをパースする関数
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      // 引用符を除去
      const cleanedValues = values.map(value => 
        value.startsWith('"') && value.endsWith('"') 
          ? value.slice(1, -1) 
          : value
      );
      
      if (cleanedValues.length >= headers.length) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = cleanedValues[index] || '';
        });
        data.push(row);
      }
    } catch (error) {
      // パースエラーの行をスキップ
      console.warn(`CSV line ${i} parse error:`, error);
      continue;
    }
  }
  
  return data;
}

// メンバー情報を解析
function parseMembers(memberText: string): Member[] {
  if (!memberText) return [];
  
  return memberText.split('<br>')
    .map(member => member.trim())
    .filter(member => member && member !== '')
    .map(member => {
      // 楽器記号を抽出（統合された役職と中点記号に対応：Tb/MC, B・Vo等）
      const instrumentMatch = member.match(/^([★◆●◎]*)([A-Za-z]+(?:\/[A-Za-z]+|・[A-Za-z]+)*)/);
      const instrument = instrumentMatch ? instrumentMatch[2] : '';
      const symbols = instrumentMatch ? instrumentMatch[1] : '';
      
      // 名前を抽出（楽器記号の後）
      const nameMatch = member.match(/^[★◆●◎]*[A-Za-z]+(?:\/[A-Za-z]+|・[A-Za-z]+)*\s+([^（]+)/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      
      // 大学情報を抽出
      const universityMatch = member.match(/（([^）]+)）/);
      const university = universityMatch ? universityMatch[1] : '';
      
      return {
        symbols: symbols,
        instrument: instrument,
        name: name,
        university: university
      };
    });
}

// データを正規化
function normalizeData(data: Record<string, string>[]): YamanoHistoryEntry[] {
  return data.map(row => {
    // 空の行をスキップ
    if (!row.YEAR || !row.BAND) return null;
    
    // バンド名を統一
    let bandName = row.BAND.trim();
    if (bandName === 'New Wave Jazz Orchestra') {
      bandName = 'The New Wave Jazz Orchestra';
    }
    
    // 楽曲を配列に変換
    const musics = row.MUSICS ? 
      row.MUSICS.split('<br>')
        .map((music: string) => music.trim())
        .filter((music: string) => music && music !== '')
        .map((music: string) => {
          // 楽曲名の正規化
          return music
            .replace(/\s+/g, ' ') // 複数のスペースを1つに
            .replace(/\(/g, ' (') // 括弧の前にスペースを追加
            .replace(/\s+/g, ' ') // 再度スペースを正規化
            .trim();
        }) : [];
    
    // メンバー情報を解析
    const members = parseMembers(row.MEMBER);
    
    return {
      year: parseInt(row.YEAR),
      band: bandName,
      prize: row.PRIZE ? row.PRIZE.trim() : '',
      soloPrize: row.SOLOPRIZE ? row.SOLOPRIZE.trim() : '',
      imagePath: row.PICS ? row.PICS.trim() : '',
      musics: musics,
      url1: row.URL1 ? row.URL1.trim() : '',
      url2: row.URL2 ? row.URL2.trim() : '',
      members: members
    };
  }).filter(row => row !== null);
}

export async function GET() {
  try {
    // CSVファイルを読み込み（文字エンコーディング自動検出）
    const csvPath = path.join(process.cwd(), 'src/app/Yamano History.csv');
    const csvBuffer = fs.readFileSync(csvPath);
    
    // 文字エンコーディングを試行
    let csvContent: string;
    try {
      // まずUTF-8として試行
      csvContent = csvBuffer.toString('utf-8');
    } catch {
      try {
        // SJISとして試行
        csvContent = iconv.decode(csvBuffer, 'shift_jis');
      } catch {
        // 最後の手段としてLatin-1
        csvContent = csvBuffer.toString('latin1');
      }
    }
    
    // CSVをパース
    const rawData = parseCSV(csvContent);
    
    
    // データを正規化
    const normalizedData = normalizeData(rawData);
    
    // 年でソート（新しい順）
    normalizedData.sort((a, b) => b.year - a.year);
    
    // 統計情報を生成
    const stats = {
      totalYears: normalizedData.length,
      yearRange: {
        start: Math.min(...normalizedData.map(d => d.year)),
        end: Math.max(...normalizedData.map(d => d.year))
      },
      bands: [...new Set(normalizedData.map(d => d.band))],
      totalMusics: normalizedData.reduce((sum, d) => sum + d.musics.length, 0),
      totalMembers: normalizedData.reduce((sum, d) => sum + d.members.length, 0)
    };
    
    const result: YamanoHistoryData = {
      stats: stats,
      data: normalizedData
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing CSV data:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV data' },
      { status: 500 }
    );
  }
}
