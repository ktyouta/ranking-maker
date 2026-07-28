import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UpdateUserRequestSchema, UpdateUserRequestType } from "../types/update-user-request-type";


export function useUpdateUserForm() {

    return useForm<UpdateUserRequestType>({
        resolver: zodResolver(UpdateUserRequestSchema),
        defaultValues: {
            name: ``,
            birthday: {
                year: ``,
                month: ``,
                day: ``,
            },
        },
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });
}