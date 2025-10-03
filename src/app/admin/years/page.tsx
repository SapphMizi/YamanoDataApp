'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { YearEntryService } from '@/lib/database'
import { YearEntry } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Search, Calendar, Home } from 'lucide-react'

function YearListPage() {
  const { user } = useAuth()
  const [years, setYears] = useState<YearEntry[]>([])
  const [filteredYears, setFilteredYears] = useState<YearEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBand, setSelectedBand] = useState('')

  useEffect(() => {
    loadYears()
  }, [])

  useEffect(() => {
    filterYears()
  }, [years, searchTerm, selectedBand])

  const loadYears = async () => {
    try {
      setLoading(true)
      const data = await YearEntryService.getAll()
      setYears(data)
    } catch (error) {
      console.error('Failed to load years:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterYears = () => {
    let filtered = years

    if (searchTerm) {
      filtered = filtered.filter(year => 
        year.year.toString().includes(searchTerm) ||
        year.band.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (year.prize && year.prize.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedBand) {
      filtered = filtered.filter(year => year.band === selectedBand)
    }

    setFilteredYears(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この年度情報を削除しますか？')) return

    try {
      await YearEntryService.delete(id)
      await loadYears()
    } catch (error) {
      console.error('Failed to delete year:', error)
      alert('削除に失敗しました')
    }
  }

  const getBands = () => {
    const bands = [...new Set(years.map(year => year.band))]
    return bands
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-foreground">年度情報管理</h1>
                <p className="text-muted-foreground">年度情報の一覧・編集</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  ユーザー画面
                </Button>
              </Link>
              <Link href="/admin/years/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新規追加
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* フィルター */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">検索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="年度、バンド名、受賞歴で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">バンド</label>
                  <select
                    value={selectedBand}
                    onChange={(e) => setSelectedBand(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">すべてのバンド</option>
                    {getBands().map(band => (
                      <option key={band} value={band}>{band}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">統計</label>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {filteredYears.length}件
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 年度一覧 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYears.map((year) => (
            <Card key={year.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {year.year}年 - {year.band}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {year.prize && (
                        <Badge variant="default" className="text-xs">
                          {year.prize}
                        </Badge>
                      )}
                      {year.soloPrize && (
                        <Badge variant="secondary" className="text-xs">
                          ソロ賞: {year.soloPrize}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div>楽曲数: {year.musics.length}曲</div>
                    <div>メンバー数: {year.members.length}名</div>
                    {year.imagePath && <div>画像: あり</div>}
                    {(year.url1 || year.url2) && <div>動画: あり</div>}
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/years/${year.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(year.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredYears.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm || selectedBand ? '該当する年度情報が見つかりませんでした。' : '年度情報がありません。'}
                </p>
                <Link href="/admin/years/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    最初の年度を追加
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AdminYearsPage() {
  return (
    <ProtectedRoute>
      <YearListPage />
    </ProtectedRoute>
  )
}
