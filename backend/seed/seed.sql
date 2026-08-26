-- =============================================
-- Seed Data
-- テーブルはマイグレーション済みであることが前提
-- 実行: npm run db:seed:local
-- =============================================

-- 公開ステータスマスタ（ranking_master.public_status のFK先。PublicStatus VO の PRIVATE=1 / PUBLIC=2 と対応）
INSERT OR IGNORE INTO public_status_master (id, name, created_at, updated_at) VALUES
  (1, '非公開', '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'),
  (2, '公開', '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z');
