import { paths } from "@/config/paths";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { formatDate } from "@/utils/date-util";
import { useCallback, useMemo } from "react";
import { useTrashList } from "../api/get-trash-list";

/**
 * ゴミ箱一覧画面用の状態を組み立てる
 */
export const useTrashListScreen = () => {

    // ルーティング用
    const { appNavigate } = useAppNavigation();
    // ゴミ箱一覧取得
    const trashListQuery = useTrashList();

    // 画面表示用に整形したゴミ箱一覧
    const trashList = useMemo(() => {
        return trashListQuery.data.data.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            itemCount: ranking.itemCount,
            deletedAt: formatDate(ranking.updatedAt),
        }));
    }, [trashListQuery.data]);

    /**
     * ゴミ箱詳細画面へ遷移
     */
    const selectTrash = useCallback((id: string) => {
        appNavigate(paths.trashDetail.getHref(id));
    }, [appNavigate]);

    return {
        trashList,
        onSelectTrash: selectTrash,
    }
}
