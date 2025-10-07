-- 既存データベースの更新用マイグレーションスクリプト
-- musicsカラムをTEXT[]からJSONBに変更し、既存データを変換

-- 1. 既存のmusicsカラムのデータを一時的に保存するための新しいカラムを追加
ALTER TABLE year_entries ADD COLUMN musics_new JSONB DEFAULT '[]';

-- 2. 既存のTEXT[]データを新しいJSONB形式に変換
UPDATE year_entries
SET musics_new = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'title', music_title,
      'soloists', '[]'::jsonb
    )
  )
  FROM unnest(musics) AS music_title
)
WHERE musics IS NOT NULL AND array_length(musics, 1) > 0;

-- 3. 古いmusicsカラムを削除
ALTER TABLE year_entries DROP COLUMN musics;

-- 4. 新しいカラムの名前をmusicsに変更
ALTER TABLE year_entries RENAME COLUMN musics_new TO musics;

-- 5. デフォルト値を設定
ALTER TABLE year_entries ALTER COLUMN musics SET DEFAULT '[]'::jsonb;

-- 完了メッセージ
COMMENT ON COLUMN year_entries.musics IS '楽曲情報（タイトルとソリスト情報を含むJSON配列）';

