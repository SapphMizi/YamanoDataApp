'use client'

import { ProtectedRoute, useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { LogOut, Plus, Edit, Database, Users, Home } from 'lucide-react'

function AdminDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">管理者ダッシュボード</h1>
              <div className="text-muted-foreground">
                ようこそ、管理者さん
                <Badge variant="secondary" className="ml-2">
                  {user?.role === 'super_admin' ? 'スーパー管理者' : '管理者'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  ユーザー画面
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 年度情報管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                年度情報管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                年度情報の作成、編集、削除を行います。
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/admin/years">
                  <Button className="w-full" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    年度情報一覧・編集
                  </Button>
                </Link>
                <Link href="/admin/years/new">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    新しい年度を追加
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* データ管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                データ管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                データベースの操作とデータの同期を行います。
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/admin/data/migrate">
                  <Button className="w-full" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    JSONからデータ移行
                  </Button>
                </Link>
                <Link href="/admin/data/export">
                  <Button className="w-full" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    データエクスポート
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* システム情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                システム情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">データベース:</span>
                  <Badge variant="outline">Supabase</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">認証:</span>
                  <Badge variant="outline">管理者認証</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">権限:</span>
                  <Badge variant="secondary">
                    {user?.role === 'super_admin' ? 'フルアクセス' : '標準'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* クイックアクション */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/years/new">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    新年度追加
                  </Button>
                </Link>
                <Link href="/admin/years">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Edit className="w-6 h-6 mb-2" />
                    年度編集
                  </Button>
                </Link>
                <Link href="/admin/data/migrate">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Database className="w-6 h-6 mb-2" />
                    データ移行
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    サイト表示
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
