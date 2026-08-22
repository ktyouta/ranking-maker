import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateRankingRequestSchema, CreateRankingRequestType } from "../types/create-ranking-request-type";

const INITIAL_ITEM_COUNT = 3;

export function useCreateRankingForm() {

    const form = useForm<CreateRankingRequestType>({
        resolver: zodResolver(CreateRankingRequestSchema),
        defaultValues: {
            title: ``,
            isPublic: false,
            memo: ``,
            items: Array.from({ length: INITIAL_ITEM_COUNT }, () => ({ itemName: ``, memo: `` })),
        },
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
