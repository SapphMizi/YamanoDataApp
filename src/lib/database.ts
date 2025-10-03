import { YearEntry, AdminUser } from './types'

// 年度情報の操作
export class YearEntryService {
  // すべての年度情報を取得
  static async getAll(): Promise<YearEntry[]> {
    try {
      const response = await fetch('/api/admin/years')
      if (!response.ok) {
        throw new Error('Failed to fetch years')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch years:', error)
      throw error
    }
  }

  // IDで年度情報を取得
  static async getById(id: string): Promise<YearEntry | null> {
    try {
      const response = await fetch(`/api/admin/years/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch year entry')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch year entry:', error)
      throw error
    }
  }

  // 年度情報を作成
  static async create(entry: Omit<YearEntry, 'id' | 'created_at' | 'updated_at'>): Promise<YearEntry> {
    try {
      const response = await fetch('/api/admin/years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create year entry')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to create year entry:', error)
      throw error
    }
  }

  // 年度情報を更新
  static async update(id: string, entry: Partial<YearEntry>): Promise<YearEntry> {
    try {
      const response = await fetch(`/api/admin/years/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update year entry')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to update year entry:', error)
      throw error
    }
  }

  // 年度情報を削除
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/years/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete year entry')
      }
    } catch (error) {
      console.error('Failed to delete year entry:', error)
      throw error
    }
  }

  // 年度とバンドで検索
  static async getByYearAndBand(year: number, band: string): Promise<YearEntry | null> {
    try {
      const allYears = await this.getAll()
      return allYears.find(yearEntry => 
        yearEntry.year === year && yearEntry.band === band
      ) || null
    } catch (error) {
      console.error('Failed to search year entry:', error)
      throw error
    }
  }
}

// 管理者認証の操作
export class AdminAuthService {
  // 管理者ログイン（パスワードのみ）
  static async login(password: string): Promise<AdminUser | null> {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        return null
      }

      const { user } = await response.json()
      return user
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  }

  // 管理者ユーザーを取得
  static async getById(id: string): Promise<AdminUser | null> {
    // この機能は現在のAPI設計では不要
    // 必要に応じて後で実装
    return null
  }

  // 管理者ユーザーを作成
  static async create(password: string, role: 'admin' | 'super_admin' = 'admin'): Promise<AdminUser> {
    // この機能は現在のAPI設計では不要
    // 必要に応じて後で実装
    throw new Error('Create admin user not implemented')
  }
}

// データの移行・同期
export class DataMigrationService {
  // JSONデータから年度情報を一括作成
  static async migrateFromJson(data: any[]): Promise<void> {
    try {
      // 各エントリを個別に作成
      for (const entry of data) {
        const formattedEntry = {
          year: entry.year,
          band: entry.band,
          prize: entry.prize || undefined,
          soloPrize: entry.soloPrize || undefined,
          imagePath: entry.imagePath || undefined,
          musics: entry.musics || [],
          url1: entry.url1 || undefined,
          url2: entry.url2 || undefined,
          members: entry.members || []
        }

        // 既存のエントリをチェック
        const existing = await YearEntryService.getByYearAndBand(entry.year, entry.band)
        
        if (existing) {
          // 更新
          await YearEntryService.update(existing.id!, formattedEntry)
        } else {
          // 新規作成
          await YearEntryService.create(formattedEntry)
        }
      }
    } catch (error) {
      console.error('Migration error:', error)
      throw error
    }
  }

  // データベースからJSON形式でエクスポート
  static async exportToJson(): Promise<any[]> {
    const entries = await YearEntryService.getAll()
    
    return entries.map(entry => ({
      year: entry.year,
      band: entry.band,
      prize: entry.prize,
      soloPrize: entry.soloPrize,
      imagePath: entry.imagePath,
      musics: entry.musics,
      url1: entry.url1,
      url2: entry.url2,
      members: entry.members
    }))
  }
}
