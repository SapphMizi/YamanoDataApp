'use client'

import { useState } from 'react'
import { ProtectedRoute, useAuth } from '@/lib/auth'
import { DataMigrationService } from '@/lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Upload, Download, Home } from 'lucide-react'
import Link from 'next/link'

function DataMigratePageContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleMigrateFromJson = async () => {
    try {
      setLoading(true)
      setResult('JSONファイルからデータを読み込み中...')

      // API Routeを使用してデータ移行
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'migrate_from_json' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'データ移行に失敗しました')
      }

      const result = await response.json()
      setResult(`移行完了: ${result.message}`)
    } catch (error) {
      console.error('Migration failed:', error)
      setResult(`エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExportToJson = async () => {
    try {
      setLoading(true)
      setResult('データベースからエクスポート中...')

      const data = await DataMigrationService.exportToJson()
      
      // JSONファイルをダウンロード
      const jsonString = JSON.stringify({ data }, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `yamano-history-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setResult(`エクスポート完了: ${data.length}件の年度情報をダウンロードしました`)
    } catch (error) {
      console.error('Export failed:', error)
      setResult(`エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`)
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
                <h1 className="text-2xl font-bold text-foreground">データ移行</h1>
                <p className="text-muted-foreground">JSONデータとデータベースの同期</p>
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
          {/* 移行オプション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JSONからデータベースへ移行 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  JSON → データベース
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  public/yamano-history.jsonファイルからデータベースに年度情報を移行します。
                  既存のデータは上書きされます。
                </p>
                <Button 
                  onClick={handleMigrateFromJson}
                  disabled={loading}
                  className="w-full"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {loading ? '移行中...' : '移行を実行'}
                </Button>
              </CardContent>
            </Card>

            {/* データベースからJSONへエクスポート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  データベース → JSON
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  データベースの年度情報をJSONファイルとしてダウンロードします。
                  バックアップやデータの確認に使用できます。
                </p>
                <Button 
                  onClick={handleExportToJson}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'エクスポート中...' : 'エクスポートを実行'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 実行結果 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>実行結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 注意事項 */}
          <Card>
            <CardHeader>
              <CardTitle>注意事項</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>JSONからデータベースへの移行は既存データを上書きします</li>
                <li>移行前に重要なデータは必ずバックアップを取ってください</li>
                <li>エクスポート機能を使用してデータのバックアップを作成できます</li>
                <li>移行処理中は他の操作を行わないでください</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DataMigratePage() {
  return (
    <ProtectedRoute>
      <DataMigratePageContent />
    </ProtectedRoute>
  )
}
