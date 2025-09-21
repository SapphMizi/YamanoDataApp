const fs = require('fs');
const path = require('path');

// CSVファイルを読み込み
const csvPath = path.join(__dirname, '../app/Yamano History.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// CSVをパース
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = [];
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
    
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// データを正規化
function normalizeData(data) {
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
        .map(music => music.trim())
        .filter(music => music && music !== '')
        .map(music => {
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

// メンバー情報を解析
function parseMembers(memberText) {
  if (!memberText) return [];
  
  return memberText.split('<br>')
    .map(member => member.trim())
    .filter(member => member && member !== '')
    .map(member => {
      // 楽器記号を抽出
      const instrumentMatch = member.match(/^([★◆●◎]*)([A-Za-z]+)/);
      const instrument = instrumentMatch ? instrumentMatch[2] : '';
      const symbols = instrumentMatch ? instrumentMatch[1] : '';
      
      // 名前を抽出（楽器記号の後）
      const nameMatch = member.match(/^[★◆●◎]*[A-Za-z]+\s+([^（]+)/);
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

// メイン処理
const rawData = parseCSV(csvContent);
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

// 結果を保存
const outputData = {
  stats: stats,
  data: normalizedData
};

const outputPath = path.join(__dirname, 'yamano-history.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

console.log('データ処理完了！');
console.log(`処理された年数: ${stats.totalYears}`);
console.log(`年範囲: ${stats.yearRange.start} - ${stats.yearRange.end}`);
console.log(`バンド数: ${stats.bands.length}`);
console.log(`総楽曲数: ${stats.totalMusics}`);
console.log(`総メンバー数: ${stats.totalMembers}`);
console.log(`出力ファイル: ${outputPath}`);
