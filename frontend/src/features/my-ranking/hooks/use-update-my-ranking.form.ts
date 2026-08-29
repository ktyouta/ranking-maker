import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { UpdateMyRankingRequestSchema, UpdateMyRankingRequestType } from "../types/update-my-ranking-request-type";

export function useUpdateMyRankingForm(defaultValues: UpdateMyRankingRequestType) {

    const form = useForm<UpdateMyRankingRequestType>({
        resolver: zodResolver(UpdateMyRankingRequestSchema),
        defaultValues,
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
