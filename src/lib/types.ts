// データベースの型定義

export interface Member {
  id?: string
  symbols?: string
  instrument: string
  name: string
  university?: string
}

export interface Soloist {
  memberId?: string // メンバーID（メンバー配列内のインデックスまたは識別子）
  memberName: string // メンバー名
  instrument?: string // 楽器名
  isFeatured: boolean // フィーチャーソリストかどうか
}

export interface Music {
  title: string
  soloists: Soloist[]
}

export interface YearEntry {
  id?: string
  year: number
  band: string
  prize?: string
  soloPrize?: string
  imagePath?: string
  musics: Music[]
  url1?: string
  url2?: string
  members: Member[]
  created_at?: string
  updated_at?: string
}

export interface AdminUser {
  id: string
  role: 'admin' | 'super_admin'
  created_at?: string
  updated_at?: string
}

export interface YamanoHistoryData {
  stats: {
    totalYears: number
    yearRange: { start: number; end: number }
    bands: string[]
    totalMusics: number
    totalMembers: number
  }
  data: YearEntry[]
}
