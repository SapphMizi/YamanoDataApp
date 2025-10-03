'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { DataMigrationService, YearEntryService } from '@/lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Database, FileText, Home } from 'lucide-react'
import Link from 'next/link'

function DataExportPageContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalYears: 0,
    bands: [] as string[],
    yearRange: { start: 0, end: 0 }
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const years = await YearEntryService.getAll()
      const bands = [...new Set(years.map(year => year.year))]
      const yearNumbers = years.map(year => year.year)
      
      setStats({
        totalYears: years.length,
        bands: [...new Set(years.map(year => year.band))],
        yearRange: {
          start: yearNumbers.length > 0 ? Math.min(...yearNumbers) : 0,
          end: yearNumbers.length > 0 ? Math.max(...yearNumbers) : 0
        }
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleExportToJson = async () => {
    try {
      setLoading(true)
      
      const data = await DataMigrationService.exportToJson()
      
      // 統計情報も含めてエクスポート
      const exportData = {
        stats: {
          totalYears: data.length,
          yearRange: stats.yearRange,
          bands: stats.bands,
          totalMusics: data.reduce((sum, year) => sum + (year.musics?.length || 0), 0),
          totalMembers: data.reduce((sum, year) => sum + (year.members?.length || 0), 0)
        },
        data
      }
      
      // JSONファイルをダウンロード
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `yamano-history-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('エクスポートに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleExportToCsv = async () => {
    try {
      setLoading(true)
      
      const data = await DataMigrationService.exportToJson()
      
      // CSVヘッダー
      const headers = [
        'Year', 'Band', 'Prize', 'Solo Prize', 'Image Path', 
        'Music 1', 'Music 2', 'Music 3', 'Music 4', 'Music 5',
        'URL 1', 'URL 2',
        'Member 1', 'Member 2', 'Member 3', 'Member 4', 'Member 5'
      ]
      
      // CSVデータ
      const csvRows = [headers.join(',')]
      
      data.forEach(year => {
        const row = [
          year.year,
          `"${year.band}"`,
          `"${year.prize || ''}"`,
          `"${year.soloPrize || ''}"`,
          `"${year.imagePath || ''}"`,
          ...Array.from({ length: 5 }, (_, i) => `"${year.musics?.[i] || ''}"`),
          `"${year.url1 || ''}"`,
          `"${year.url2 || ''}"`,
          ...Array.from({ length: 5 }, (_, i) => {
            const member = year.members?.[i]
            return member ? `"${member.symbols || ''}${member.instrument} ${member.name}（${member.university || ''}）"` : '""'
          })
        ]
        csvRows.push(row.join(','))
      })
      
      const csvString = csvRows.join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `yamano-history-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('CSV Export failed:', error)
      alert('CSVエクスポートに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ダッシュボード
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">データエクスポート</h1>
                <p className="text-muted-foreground">データベースの年度情報をエクスポート</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                ユーザー画面
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* データ統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                データ統計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalYears}</div>
                  <div className="text-sm text-muted-foreground">年度数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.bands.length}</div>
                  <div className="text-sm text-muted-foreground">バンド数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {stats.yearRange.start > 0 && stats.yearRange.end > 0 
                      ? `${stats.yearRange.start}-${stats.yearRange.end}` 
                      : 'なし'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">年度範囲</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-2">バンド一覧:</div>
                <div className="flex flex-wrap gap-2">
                  {stats.bands.map(band => (
                    <Badge key={band} variant="outline">{band}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* エクスポートオプション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JSONエクスポート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  JSON形式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  完全なデータ構造を保持するJSON形式でエクスポートします。
                  バックアップやデータ移行に最適です。
                </p>
                <Button 
                  onClick={handleExportToJson}
                  disabled={loading || stats.totalYears === 0}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'エクスポート中...' : 'JSONでダウンロード'}
                </Button>
              </CardContent>
            </Card>

            {/* CSVエクスポート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  CSV形式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  ExcelやGoogleスプレッドシートで開けるCSV形式でエクスポートします。
                  表計算ソフトでの分析に適しています。
                </p>
                <Button 
                  onClick={handleExportToCsv}
                  disabled={loading || stats.totalYears === 0}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'エクスポート中...' : 'CSVでダウンロード'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 注意事項 */}
          <Card>
            <CardHeader>
              <CardTitle>注意事項</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>JSON形式は完全なデータ構造を保持し、データ移行に適しています</li>
                <li>CSV形式は表計算ソフトでの分析に適していますが、一部のデータ構造は簡略化されます</li>
                <li>エクスポートしたファイルは適切に管理し、第三者に漏洩しないよう注意してください</li>
                <li>定期的にバックアップを取ることをお勧めします</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DataExportPage() {
  return (
    <ProtectedRoute>
      <DataExportPageContent />
    </ProtectedRoute>
  )
}
