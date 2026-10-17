export type IconMasterRecord = {
    id: number;
    emoji: string;
};

export interface IGetIconsRepository {
    /**
     * 選択可能なアイコン一覧を取得する（deleteFlg=false のみ）
     */
    findIcons(): Promise<IconMasterRecord[]>;
}
