'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { YamanoHistoryData, YamanoHistoryEntry, filterByYear, filterByYearRange, filterByBand } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings, ChevronDown, ChevronRight } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<YamanoHistoryData | null>(null);
  const [filteredData, setFilteredData] = useState<YamanoHistoryEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [yearRange, setYearRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [openMembers, setOpenMembers] = useState<Set<string>>(new Set());

  // メンバー一覧の開閉を切り替え
  const toggleMembers = (entryKey: string) => {
    setOpenMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryKey)) {
        newSet.delete(entryKey);
      } else {
        newSet.add(entryKey);
      }
      return newSet;
    });
  };

  // データを読み込み
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from /api/history...');
        const response = await fetch('/api/history', { cache: 'no-store' });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data: YamanoHistoryData = await response.json();
        console.log('Data received:', data);
        setData(data);
        setFilteredData(data.data);
        
        // 年範囲を動的に設定
        if (data.stats.yearRange.start > 0 && data.stats.yearRange.end > 0) {
          setYearRange({
            start: data.stats.yearRange.start,
            end: data.stats.yearRange.end
          });
        }
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground text-sm">データを読み込み中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-foreground">Yamano History</h1>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="h-8 px-3">
                <Settings className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">管理者</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* フィルター */}
      <div className="border-b bg-card">
        <div className="px-4 py-3">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* 年選択 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    年を選択
                  </label>
                  <Select
                    value={selectedYear?.toString() || undefined}
                    onValueChange={(value) => setSelectedYear(value ? parseInt(value) : null)}
                    disabled={!data || data.stats.yearRange.start === 0}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={data ? "すべての年" : "読み込み中..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {data && data.stats.yearRange.start > 0 && data.stats.yearRange.end > 0 && 
                        Array.from({ length: data.stats.yearRange.end - data.stats.yearRange.start + 1 }, (_, i) => {
                          const year = data.stats.yearRange.end - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}年
                            </SelectItem>
                          );
                        })
                      }
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
                    disabled={!data || data.stats.bands.length === 0}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={data ? "すべてのバンド" : "読み込み中..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {data && data.stats.bands.map((band) => (
                        <SelectItem key={band} value={band}>
                          {band}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 年範囲選択 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    年範囲
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={yearRange.start || ''}
                      onChange={(e) => setYearRange({ ...yearRange, start: parseInt(e.target.value) || 0 })}
                      className="h-10 flex-1"
                      min={data?.stats.yearRange.start || 0}
                      max={data?.stats.yearRange.end || 0}
                      disabled={!data || data.stats.yearRange.start === 0}
                      placeholder={data ? `${data.stats.yearRange.start}` : '読み込み中...'}
                    />
                    <span className="flex items-center text-muted-foreground px-2">-</span>
                    <Input
                      type="number"
                      value={yearRange.end || ''}
                      onChange={(e) => setYearRange({ ...yearRange, end: parseInt(e.target.value) || 0 })}
                      className="h-10 flex-1"
                      min={data?.stats.yearRange.start || 0}
                      max={data?.stats.yearRange.end || 0}
                      disabled={!data || data.stats.yearRange.end === 0}
                      placeholder={data ? `${data.stats.yearRange.end}` : '読み込み中...'}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-4 py-4">

        {/* データ一覧 */}
        <div className="space-y-4">
          {filteredData.map((entry) => (
            <Card key={`${entry.year}-${entry.band}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {entry.year}年 - {entry.band}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.prize && (
                        <Badge variant="default" className="text-xs">
                          {entry.prize}
                        </Badge>
                      )}
                      {entry.soloPrize && (
                        <Badge variant="secondary" className="text-xs">
                          ソロ賞: {entry.soloPrize}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-40 relative rounded-lg overflow-hidden shadow-md bg-muted flex items-center justify-center">
                    {entry.imagePath ? (
                      <Image
                        src={`/${entry.imagePath}`}
                        alt={`${entry.year}年 ${entry.band}`}
                        width={160}
                        height={160}
                        className="object-cover w-full h-full"
                        sizes="100vw"
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
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">演奏楽曲</h3>
                    <div className="space-y-2">
                      {entry.musics.map((music, index) => {
                        // JSON文字列として保存されているデータを処理
                        let musicData = music;
                        if (typeof music === 'string') {
                          musicData = music;
                        } else if (typeof music.title === 'string' && music.title.startsWith('{')) {
                          // titleがJSON文字列の場合、パースする
                          try {
                            musicData = JSON.parse(music.title);
                          } catch {
                            musicData = music;
                          }
                        }
                        
                        const title = typeof musicData === 'string' ? musicData : musicData.title;
                        const soloists = typeof musicData !== 'string' ? musicData.soloists : undefined;
                        
                        return (
                          <div key={index} className="border rounded-lg p-3 bg-card">
                            <div className="flex flex-col gap-2">
                              <div className="font-medium text-sm">{title}</div>
                              {soloists && soloists.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="text-xs text-muted-foreground">ソリスト:</span>
                                  {soloists.map((soloist: any, soloistIndex: number) => (
                                    <div key={soloistIndex} className="flex items-center gap-1">
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                      >
                                        {soloist.memberName}
                                        {soloist.instrument && ` (${soloist.instrument})`}
                                        {soloist.isFeatured && " ⭐"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 動画リンク */}
                {(entry.url1 || entry.url2) && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">動画</h3>
                    <div className="flex flex-col gap-2">
                      {entry.url1 && (
                        <a
                          href={entry.url1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline text-sm py-2 px-3 bg-primary/5 rounded-md"
                        >
                          動画1
                        </a>
                      )}
                      {entry.url2 && (
                        <a
                          href={entry.url2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline text-sm py-2 px-3 bg-primary/5 rounded-md"
                        >
                          動画2
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* メンバー一覧 */}
                {entry.members.length > 0 && (
                  <Collapsible 
                    open={openMembers.has(`${entry.year}-${entry.band}`)}
                    onOpenChange={() => toggleMembers(`${entry.year}-${entry.band}`)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between p-0 h-auto text-sm font-semibold text-foreground mb-2 hover:bg-transparent"
                      >
                        <span>メンバー ({entry.members.length}名)</span>
                        {openMembers.has(`${entry.year}-${entry.band}`) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2">
                        {entry.members.map((member, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-card">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {member.symbols && (
                                  <Badge variant="secondary" className="text-xs">
                                    {member.symbols}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {member.instrument}
                                </Badge>
                                <span className="font-medium text-sm">{member.name}</span>
                              </div>
                              {member.university && (
                                <div className="text-xs text-muted-foreground">
                                  {member.university}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">該当するデータが見つかりませんでした。</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}