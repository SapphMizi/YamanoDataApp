# 管理者機能セットアップガイド

## 概要

Yamano History アプリケーションに管理者機能を追加しました。この機能により、年度情報の作成・編集・削除、データベースとの同期が可能になります。

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase Configuration
# これらの値はSupabaseプロジェクトのダッシュボードから取得してください
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authentication
# 管理者パスワード（本番環境では適切なパスワードに変更してください）
ADMIN_PASSWORD=admin_password
```

**重要**: 環境変数が設定されていない場合、管理者機能は無効になります。アプリケーションは通常通り動作しますが、管理者機能にアクセスしようとするとエラーが表示されます。

### 3. データベーススキーマの設定

1. SupabaseのダッシュボードでSQL Editorを開く
2. `supabase-schema.sql`ファイルの内容を実行
3. 初期管理者ユーザーが作成されます

### 4. 依存関係のインストール

```bash
npm install
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 管理者機能

### アクセス方法

1. メインページの右上の「管理者」ボタンをクリック
2. 管理者ログインページでパスワードを入力
3. 管理者ダッシュボードにアクセス

### 利用可能な機能

#### 年度情報管理
- **年度情報一覧**: 既存の年度情報を閲覧・検索
- **新規年度追加**: 新しい年度の情報を追加
- **年度情報編集**: 既存の年度情報を編集
- **年度情報削除**: 不要な年度情報を削除

#### データ管理
- **JSON移行**: 既存のJSONファイルからデータベースに移行
- **データエクスポート**: データベースからJSON/CSV形式でエクスポート

### データ構造

#### 年度情報 (YearEntry)
- `year`: 年度 (number)
- `band`: バンド名 (string)
- `prize`: 受賞歴 (string, optional)
- `soloPrize`: ソロ賞 (string, optional)
- `imagePath`: 画像パス (string, optional)
- `musics`: 演奏楽曲一覧 (string[])
- `url1`: 動画1 URL (string, optional)
- `url2`: 動画2 URL (string, optional)
- `members`: メンバー情報 (Member[])

#### メンバー情報 (Member)
- `symbols`: 記号 (string, optional)
- `instrument`: 楽器 (string)
- `name`: 名前 (string)
- `university`: 大学・学年 (string, optional)

## セキュリティ

### 認証
- 管理者認証が必要
- セッション管理（localStorage使用）
- ログアウト機能

### データベースセキュリティ
- Row Level Security (RLS) 有効
- 適切なポリシー設定
- サービスロールキーによる管理操作

## トラブルシューティング

### よくある問題

1. **Supabase接続エラー**
   - 環境変数が正しく設定されているか確認
   - Supabaseプロジェクトがアクティブか確認
   - エラーメッセージ: "Supabase is not configured" → `.env.local`ファイルを作成

2. **認証エラー**
   - 管理者ユーザーがデータベースに作成されているか確認
   - パスワードが正しいか確認（デフォルト: admin_password）
   - エラーメッセージ: "Supabase admin client is not configured" → 環境変数を確認

3. **データ移行エラー**
   - JSONファイルが正しい形式か確認
   - データベースのスキーマが正しく設定されているか確認

4. **環境変数エラー**
   - `.env.local`ファイルがプロジェクトルートに存在するか確認
   - 環境変数の値に余分なスペースや引用符がないか確認
   - 開発サーバーを再起動して環境変数を読み込み直す

### ログの確認

ブラウザの開発者ツールのコンソールでエラーメッセージを確認してください。

## 今後の拡張

- パスワードハッシュ化の実装
- より詳細なログ機能
- データバックアップの自動化
- 複数管理者の管理機能

## サポート

問題が発生した場合は、以下の情報を含めてお知らせください：
- エラーメッセージ
- 実行した操作
- ブラウザの種類とバージョン
- 環境変数の設定状況（機密情報は除く）
