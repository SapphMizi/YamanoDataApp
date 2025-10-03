-- Supabase データベーススキーマ

-- 年度情報テーブル
CREATE TABLE year_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  band TEXT NOT NULL,
  prize TEXT,
  solo_prize TEXT,
  image_path TEXT,
  musics TEXT[] DEFAULT '{}',
  url1 TEXT,
  url2 TEXT,
  members JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理者ユーザーテーブル
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_year_entries_year ON year_entries(year);
CREATE INDEX idx_year_entries_band ON year_entries(band);
CREATE INDEX idx_year_entries_year_band ON year_entries(year, band);

-- RLS (Row Level Security) の設定
ALTER TABLE year_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 年度情報のRLSポリシー（読み取りは全員、書き込みは認証済みユーザーのみ）
CREATE POLICY "Anyone can read year_entries" ON year_entries
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert year_entries" ON year_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update year_entries" ON year_entries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete year_entries" ON year_entries
  FOR DELETE USING (auth.role() = 'authenticated');

-- 管理者ユーザーのRLSポリシー（管理者のみアクセス可能）
CREATE POLICY "Admin users can read admin_users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin users can update admin_users" ON admin_users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can delete admin_users" ON admin_users
  FOR DELETE USING (auth.role() = 'authenticated');

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_year_entries_updated_at
  BEFORE UPDATE ON year_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期管理者ユーザーの作成（パスワードは実際の環境では適切にハッシュ化してください）
INSERT INTO admin_users (password_hash, role) VALUES 
('admin_password', 'super_admin');
