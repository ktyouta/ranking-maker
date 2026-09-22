import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_ICON_ID } from "@/constants/icon";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateRankingRequestSchema, CreateRankingRequestType } from "../types/create-ranking-request-type";

const INITIAL_ITEM_COUNT = 3;

/**
 * フォームの初期値（テンプレート反映等で上書きされた後、クリア時に戻す先としても使う）
 */
export function getCreateRankingDefaultValues(): CreateRankingRequestType {
    return {
        title: ``,
        isPublic: false,
        icon: DEFAULT_ICON_ID,
        memo: ``,
        items: Array.from({ length: INITIAL_ITEM_COUNT }, () => ({ itemName: ``, memo: `` })),
    };
}

export function useCreateRankingForm() {

    const form = useForm<CreateRankingRequestType>({
        resolver: zodResolver(CreateRankingRequestSchema),
        defaultValues: getCreateRankingDefaultValues(),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });

    const itemFieldArray = useFieldArray({
        control: form.control,
        name: "items",
    });

    return {
        ...form,
        itemFieldArray,
    };
}
