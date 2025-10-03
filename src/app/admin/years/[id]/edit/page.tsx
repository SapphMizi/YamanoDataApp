'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { YearEntryService } from '@/lib/database'
import { YearEntry, Member } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

function EditYearPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const yearId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [yearEntry, setYearEntry] = useState<YearEntry | null>(null)
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    band: 'The New Wave Jazz Orchestra',
    prize: '',
    soloPrize: '',
    imagePath: '',
    musics: [''],
    url1: '',
    url2: '',
    members: [] as Member[]
  })

  useEffect(() => {
    if (yearId) {
      loadYearEntry()
    }
  }, [yearId])

  const loadYearEntry = async () => {
    try {
      setLoading(true)
      const entry = await YearEntryService.getById(yearId)
      if (entry) {
        setYearEntry(entry)
        setFormData({
          year: entry.year,
          band: entry.band,
          prize: entry.prize || '',
          soloPrize: entry.soloPrize || '',
          imagePath: entry.imagePath || '',
          musics: entry.musics.length > 0 ? entry.musics : [''],
          url1: entry.url1 || '',
          url2: entry.url2 || '',
          members: entry.members.length > 0 ? entry.members : []
        })
      }
    } catch (error) {
      console.error('Failed to load year entry:', error)
      alert('年度情報の読み込みに失敗しました')
      router.push('/admin/years')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMusicChange = (index: number, value: string) => {
    const newMusics = [...formData.musics]
    newMusics[index] = value
    setFormData(prev => ({ ...prev, musics: newMusics }))
  }

  const addMusic = () => {
    setFormData(prev => ({ ...prev, musics: [...prev.musics, ''] }))
  }

  const removeMusic = (index: number) => {
    const newMusics = formData.musics.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, musics: newMusics }))
  }

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setFormData(prev => ({ ...prev, members: newMembers }))
  }

  const addMember = () => {
    const newMember: Member = {
      symbols: '',
      instrument: '',
      name: '',
      university: ''
    }
    setFormData(prev => ({ ...prev, members: [...prev.members, newMember] }))
  }

  const removeMember = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, members: newMembers }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: Partial<YearEntry> = {
        year: formData.year,
        band: formData.band,
        prize: formData.prize || undefined,
        soloPrize: formData.soloPrize || undefined,
        imagePath: formData.imagePath || undefined,
        musics: formData.musics.filter(music => music.trim() !== ''),
        url1: formData.url1 || undefined,
        url2: formData.url2 || undefined,
        members: formData.members.filter(member => member.name.trim() !== '')
      }

      await YearEntryService.update(yearId, updateData)
      router.push('/admin/years')
    } catch (error) {
      console.error('Failed to update year entry:', error)
      alert('年度情報の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!yearEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">年度情報が見つかりません</h2>
          <Link href="/admin/years">
            <Button>一覧に戻る</Button>
          </Link>
        </div>
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
              <Link href="/admin/years">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  一覧に戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {yearEntry.year}年 - {yearEntry.band} を編集
                </h1>
                <p className="text-muted-foreground">年度情報を編集します</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* フォーム */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">年度 *</label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">バンド名 *</label>
                    <Input
                      value={formData.band}
                      onChange={(e) => handleInputChange('band', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">受賞歴</label>
                    <Input
                      value={formData.prize}
                      onChange={(e) => handleInputChange('prize', e.target.value)}
                      placeholder="例: 9位／学バンアワード"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ソロ賞</label>
                    <Input
                      value={formData.soloPrize}
                      onChange={(e) => handleInputChange('soloPrize', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">画像パス</label>
                  <Input
                    value={formData.imagePath}
                    onChange={(e) => handleInputChange('imagePath', e.target.value)}
                    placeholder="例: NWJO_pics/2024.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 楽曲情報 */}
            <Card>
              <CardHeader>
                <CardTitle>演奏楽曲</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.musics.map((music, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={music}
                      onChange={(e) => handleMusicChange(index, e.target.value)}
                      placeholder="楽曲名を入力"
                    />
                    {formData.musics.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMusic(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addMusic}>
                  <Plus className="w-4 h-4 mr-2" />
                  楽曲を追加
                </Button>
              </CardContent>
            </Card>

            {/* 動画リンク */}
            <Card>
              <CardHeader>
                <CardTitle>動画リンク</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">動画1 URL</label>
                  <Input
                    value={formData.url1}
                    onChange={(e) => handleInputChange('url1', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">動画2 URL</label>
                  <Input
                    value={formData.url2}
                    onChange={(e) => handleInputChange('url2', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* メンバー情報 */}
            <Card>
              <CardHeader>
                <CardTitle>メンバー情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.members.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">メンバー {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">記号</label>
                        <Input
                          value={member.symbols || ''}
                          onChange={(e) => handleMemberChange(index, 'symbols', e.target.value)}
                          placeholder="例: ★, ◆, ●, ◎"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">楽器 *</label>
                        <Input
                          value={member.instrument}
                          onChange={(e) => handleMemberChange(index, 'instrument', e.target.value)}
                          placeholder="例: Tb, ASx, TSx"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">名前 *</label>
                        <Input
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="例: 田中 太郎"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">大学・学年</label>
                        <Input
                          value={member.university || ''}
                          onChange={(e) => handleMemberChange(index, 'university', e.target.value)}
                          placeholder="例: 大阪大 工3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addMember}>
                  <Plus className="w-4 h-4 mr-2" />
                  メンバーを追加
                </Button>
              </CardContent>
            </Card>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/years">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditYearPage() {
  return (
    <ProtectedRoute>
      <EditYearPageContent />
    </ProtectedRoute>
  )
}
