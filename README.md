# Yamano History App

The New Wave Jazz Orchestra の歴史を閲覧できるWebアプリケーション

## 概要

このアプリケーションは、The New Wave Jazz Orchestraの演奏履歴、メンバー情報、楽曲データを閲覧できるモバイル対応のWebアプリケーションです。1980年から2024年までの45年間のデータを収録しています。

## 主な機能

### 📱 モバイルファーストデザイン
- スマートフォンでの閲覧に最適化
- レスポンシブデザインでタブレット・デスクトップにも対応
- 大きな画像表示で見やすさを重視

### 🎵 データ表示機能
- **年別フィルタリング**: 特定の年度のデータを表示
- **バンド別フィルタリング**: 複数のバンドから選択
- **年範囲指定**: 指定した期間のデータを表示

### 👥 メンバー情報
- 楽器・役職情報（Tb/MC、B・Vo等の統合役職にも対応）
- 所属大学情報
- メンバーシンボル（★、◆、●、◎）の表示

### 🎼 楽曲・動画情報
- 演奏楽曲一覧
- YouTube動画リンク
- 受賞歴・ソロ賞情報

## 技術スタック

- **フロントエンド**: Next.js 15.5.3 + React 19.1.0
- **スタイリング**: Tailwind CSS 3.4.17
- **言語**: TypeScript
- **UIコンポーネント**: Radix UI
- **デプロイ**: Vercel

## セットアップ

### 必要な環境
- Node.js 18.0以上
- npm または yarn

### インストール手順

```bash
# リポジトリをクローン
git clone https://github.com/SapphMizi/YamanoDataApp.git
cd YamanoDataApp

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセスできます。

## 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint

# CSSリンター実行
npm run lint:css
```

## データ構造

### メンバー情報の形式
```
[記号][楽器名] [名前]（大学名）
例: ★Tb 田中 太郎（大阪大 工3）
例: Tb/MC 鈴木 花子（関西大 文2）
例: B・Vo 佐藤 次郎（神戸大 経営3）
```

### 対応している統合役職
- `Tb/MC` (トロンボーン/マスター・オブ・セレモニー)
- `Tp/MC` (トランペット/マスター・オブ・セレモニー)
- `B・Vo` (ベース/ボーカル)

## デプロイ

このアプリケーションはVercelにデプロイされています。

**本番URL**: [https://yamano-data-app.vercel.app](https://yamano-data-app.vercel.app)

### 自動デプロイ
- GitHubのmainブランチにプッシュすると自動的にデプロイされます
- プレビューデプロイも自動生成されます

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## データについて

このアプリケーションで使用されているデータは、The New Wave Jazz Orchestraの公式記録に基づいています。データの正確性については、可能な限り確認していますが、間違いや不足がある場合はお知らせください。

## お問い合わせ

プロジェクトに関する質問や提案がある場合は、GitHubのIssuesページでお知らせください。

---

**The New Wave Jazz Orchestra** - 1980年から続く学生ビッグバンドの歴史を記録するプロジェクト