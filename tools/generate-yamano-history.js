/*
  Yamano History JSON generator
  - Reads src/app/Yamano History.csv (Shift_JIS/CP932)
  - Parses with the same logic as API route
  - Writes src/data/yamano-history.json
*/

const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const rawHeaders = lines[0].split(',');
  // drop trailing empty headers (after MEMBER)
  let lastNonEmpty = rawHeaders.length - 1;
  while (lastNonEmpty >= 0 && rawHeaders[lastNonEmpty].trim() === '') {
    lastNonEmpty--;
  }
  const headers = rawHeaders.slice(0, lastNonEmpty + 1).map((h) => h.trim());

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
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

      const cleanedValues = values.map((value) => {
        const trimmed = value.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });

      // align to headers length: slice or pad with empty strings
      const aligned = cleanedValues.slice(0, headers.length);
      while (aligned.length < headers.length) aligned.push('');

      const row = {};
      headers.forEach((header, index) => {
        row[header] = aligned[index] || '';
      });
      data.push(row);
    } catch (error) {
      console.warn(`CSV line ${i} parse error:`, error);
      continue;
    }
  }

  return data;
}

function parseMembers(memberText) {
  if (!memberText) return [];

  return memberText
    .split('<br>')
    .map((member) => member.trim())
    .filter((member) => member && member !== '')
    .map((member) => {
      const instrumentMatch = member.match(/^([★◆●◎]*)([A-Za-z]+(?:\/[A-Za-z]+|・[A-Za-z]+)*)/);
      const instrument = instrumentMatch ? instrumentMatch[2] : '';
      const symbols = instrumentMatch ? instrumentMatch[1] : '';

      const nameMatch = member.match(/^[★◆●◎]*[A-Za-z]+(?:\/[A-Za-z]+|・[A-Za-z]+)*\s+([^（]+)/);
      const name = nameMatch ? nameMatch[1].trim() : '';

      const universityMatch = member.match(/（([^）]+)）/);
      const university = universityMatch ? universityMatch[1] : '';

      return {
        symbols,
        instrument,
        name,
        university,
      };
    });
}

function normalizeData(data) {
  const result = data
    .map((row) => {
      if (!row.YEAR || !row.BAND) return null;

      let bandName = row.BAND.trim();
      if (bandName === 'New Wave Jazz Orchestra') {
        bandName = 'The New Wave Jazz Orchestra';
      }

      const musics = row.MUSICS
        ? row.MUSICS.split('<br>')
            .map((music) => music.trim())
            .filter((music) => music && music !== '')
            .map((music) => {
              return music
                .replace(/\s+/g, ' ')
                .replace(/\(/g, ' (')
                .replace(/\s+/g, ' ')
                .trim();
            })
        : [];

      const members = parseMembers(row.MEMBER);

      return {
        year: parseInt(row.YEAR, 10),
        band: bandName,
        prize: row.PRIZE ? row.PRIZE.trim() : '',
        soloPrize: row.SOLOPRIZE ? row.SOLOPRIZE.trim() : '',
        imagePath: row.PICS ? row.PICS.trim() : '',
        musics,
        url1: row.URL1 ? row.URL1.trim() : '',
        url2: row.URL2 ? row.URL2.trim() : '',
        members,
      };
    })
    .filter((row) => row !== null);

  return result;
}

function buildStats(entries) {
  return {
    totalYears: entries.length,
    yearRange: {
      start: Math.min(...entries.map((d) => d.year)),
      end: Math.max(...entries.map((d) => d.year)),
    },
    bands: [...new Set(entries.map((d) => d.band))],
    totalMusics: entries.reduce((sum, d) => sum + d.musics.length, 0),
    totalMembers: entries.reduce((sum, d) => sum + d.members.length, 0),
  };
}

function main() {
  const csvPath = path.join(process.cwd(), 'src/app/Yamano History.csv');
  const outPath = path.join(process.cwd(), 'src/data/yamano-history.json');

  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  const csvBuffer = fs.readFileSync(csvPath);
  let csvContent;
  try {
    csvContent = iconv.decode(csvBuffer, 'shift_jis');
  } catch (e1) {
    try {
      console.warn('Shift JIS decode failed, trying CP932');
      csvContent = iconv.decode(csvBuffer, 'cp932');
    } catch (e2) {
      console.warn('CP932 decode failed, trying SJIS');
      csvContent = iconv.decode(csvBuffer, 'sjis');
    }
  }

  const raw = parseCSV(csvContent);
  const normalized = normalizeData(raw);
  normalized.sort((a, b) => b.year - a.year);

  const stats = buildStats(normalized);
  const result = { stats, data: normalized };

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), { encoding: 'utf8' });
  console.log('Generated:', outPath);
  console.log('Entries:', normalized.length);
}

if (require.main === module) {
  main();
}
