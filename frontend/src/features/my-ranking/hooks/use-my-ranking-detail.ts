import { useCallback, useState } from 'react';

type Mode = 'view' | 'edit';

/**
 * ランキング詳細画面の閲覧・編集モード切り替えを管理する
 * データ取得・各モード固有のロジックは use-my-ranking-detail-view / use-my-ranking-detail-edit に委譲する
 */
export function useMyRankingDetail() {

    // 閲覧・編集モード
    const [mode, setMode] = useState<Mode>('view');

    /**
     * 編集モードへ切り替え
     */
    const startEdit = useCallback(() => {
        setMode('edit');
    }, []);

    /**
     * 閲覧モードへ戻す（編集キャンセル・保存成功のどちらからも呼ばれる）
     */
    const returnToView = useCallback(() => {
        setMode('view');
    }, []);

    return {
        mode,
        startEdit,
        returnToView,
    };
}
