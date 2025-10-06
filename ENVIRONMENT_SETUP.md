# 環境変数設定ガイド

このアプリケーションを動作させるために、以下の環境変数を設定する必要があります。

## 必要な環境変数

### 1. Supabase設定

```bash
# .env.local ファイルを作成
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 管理者認証設定

```bash
# 管理者パスワードのハッシュ値
ADMIN_PASSWORD_HASH=your_admin_password_hash
```

## 設定手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下を取得：
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. データベーススキーマの設定

`supabase-schema.sql`ファイルの内容をSupabaseのSQLエディタで実行してください。

### 3. 環境変数ファイルの作成

プロジェクトルートに`.env.local`ファイルを作成し、上記の環境変数を設定してください。

### 4. 管理者パスワードの設定

管理者パスワードのハッシュ値を生成するには、以下のコマンドを実行してください：

```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('your_password').digest('hex'));"
```

## デプロイ時の注意

Vercelなどのデプロイプラットフォームでは、環境変数を以下のように設定してください：

1. プロジェクトの設定画面に移動
2. Environment Variablesセクションで上記の環境変数を設定
3. デプロイを実行

## トラブルシューティング

- `supabaseUrl is required`エラーが発生する場合、環境変数が正しく設定されているか確認してください
- ビルドエラーが発生する場合、すべての環境変数が設定されているか確認してください
