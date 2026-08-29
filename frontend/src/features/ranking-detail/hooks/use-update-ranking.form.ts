import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { UpdateRankingRequestSchema, UpdateRankingRequestType } from "../types/update-ranking-request-type";

export function useUpdateRankingForm(defaultValues: UpdateRankingRequestType) {

    const form = useForm<UpdateRankingRequestType>({
        resolver: zodResolver(UpdateRankingRequestSchema),
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
