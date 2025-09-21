'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { YamanoHistoryData, YamanoHistoryEntry, filterByYear, filterByYearRange, filterByBand } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [data, setData] = useState<YamanoHistoryData | null>(null);
  const [filteredData, setFilteredData] = useState<YamanoHistoryEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [yearRange, setYearRange] = useState<{ start: number; end: number }>({ start: 1980, end: 2024 });

  // データを読み込み
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from /api/history...');
        const response = await fetch('/api/history');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data: YamanoHistoryData = await response.json();
        console.log('Data received:', data);
        setData(data);
        setFilteredData(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // エラーの場合は空のデータを設定
        const emptyData: YamanoHistoryData = {
          stats: {
            totalYears: 0,
            yearRange: { start: 1980, end: 2024 },
            bands: [],
            totalMusics: 0,
            totalMembers: 0
          },
          data: []
        };
        setData(emptyData);
        setFilteredData([]);
      }
    };
    
    fetchData();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    if (!data) return;

    let filtered = data.data;

    if (selectedYear) {
      filtered = filterByYear(filtered, selectedYear);
    } else {
      filtered = filterByYearRange(filtered, yearRange.start, yearRange.end);
    }

    if (selectedBand !== 'all') {
      filtered = filterByBand(filtered, selectedBand);
    }

    setFilteredData(filtered);
  }, [data, selectedYear, selectedBand, yearRange]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">データを読み込み中...</p>
              <p className="mt-2 text-xs text-muted-foreground">API: /api/history</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Yamano History</h1>
            </div>
          </div>
        </div>
      </header>

      {/* フィルター */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 年選択 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    年を選択
                  </label>
                  <Select
                    value={selectedYear?.toString() || undefined}
                    onValueChange={(value) => setSelectedYear(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべての年" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: data.stats.yearRange.end - data.stats.yearRange.start + 1 }, (_, i) => {
                        const year = data.stats.yearRange.end - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}年
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* バンド選択 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    バンドを選択
                  </label>
                  <Select
                    value={selectedBand === 'all' ? undefined : selectedBand}
                    onValueChange={(value) => setSelectedBand(value || 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべてのバンド" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.stats.bands.map((band) => (
                        <SelectItem key={band} value={band}>
                          {band}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 年範囲選択 */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    年範囲
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={yearRange.start}
                      onChange={(e) => setYearRange({ ...yearRange, start: parseInt(e.target.value) })}
                      className="w-24 sm:w-20"
                      min={data.stats.yearRange.start}
                      max={data.stats.yearRange.end}
                    />
                    <span className="flex items-center text-muted-foreground">-</span>
                    <Input
                      type="number"
                      value={yearRange.end}
                      onChange={(e) => setYearRange({ ...yearRange, end: parseInt(e.target.value) })}
                      className="w-24 sm:w-20"
                      min={data.stats.yearRange.start}
                      max={data.stats.yearRange.end}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* データ一覧 */}
        <div className="space-y-6">
          {filteredData.map((entry) => (
            <Card key={`${entry.year}-${entry.band}`} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl">
                      {entry.year}年 - {entry.band}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.prize && (
                        <Badge variant="default" className="text-xs sm:text-sm">
                          {entry.prize}
                        </Badge>
                      )}
                      {entry.soloPrize && (
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          ソロ賞: {entry.soloPrize}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full sm:w-48 h-48 sm:h-32 relative rounded-lg overflow-hidden shadow-md bg-muted flex items-center justify-center">
                    {entry.imagePath ? (
          <Image
                        src={`/${entry.imagePath}`}
                        alt={`${entry.year}年 ${entry.band}`}
                        width={192}
                        height={192}
                        className="object-cover w-full h-full"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        priority={false}
                        onError={(e) => {
                          console.log('Image load error:', entry.imagePath);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        画像なし
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>

                {/* 楽曲一覧 */}
                {entry.musics.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">演奏楽曲</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {entry.musics.map((music, index) => (
                        <Badge key={index} variant="outline" className="text-xs sm:text-sm p-2 justify-start">
                          {music}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 動画リンク */}
                {(entry.url1 || entry.url2) && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">動画</h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      {entry.url1 && (
                        <a
                          href={entry.url1}
          target="_blank"
          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline text-sm sm:text-base"
                        >
                          動画1
                        </a>
                      )}
                      {entry.url2 && (
                        <a
                          href={entry.url2}
          target="_blank"
          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline text-sm sm:text-base"
                        >
                          動画2
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* メンバー一覧 */}
                {entry.members.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">メンバー</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {entry.members.map((member, index) => (
                        <Card key={index} className="p-2 sm:p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <div className="flex items-center gap-2">
                              {member.symbols && (
                                <Badge variant="secondary" className="text-xs">
                                  {member.symbols}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {member.instrument}
                              </Badge>
                            </div>
                            <span className="font-medium text-xs sm:text-sm">{member.name}</span>
                          </div>
                          {member.university && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {member.university}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">該当するデータが見つかりませんでした。</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}