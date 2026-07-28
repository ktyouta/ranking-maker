import { Select, Spinner, Textbox } from "@/components";
import { MONTH_LIST } from "@/constants/date-options";
import { getDayList } from "@/utils/date-select-options";
import { BaseSyntheticEvent } from "react";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";

type PropsType = {
    errMessage: string,
    yearCoomboList: {
        label: string;
        value: string;
    }[],
    back: () => void,
    isLoading: boolean,
    register: UseFormRegister<{
        name: string;
        birthday: {
            year: string;
            month: string;
            day: string;
        };
        password: string;
        confirmPassword: string;
    }>,
    errors: FieldErrors<{
        name: string;
        birthday: {
            year: string;
            month: string;
            day: string;
        };
        password: string;
        confirmPassword: string;
    }>,
    watch: UseFormWatch<{
        name: string;
        birthday: {
            year: string;
            month: string;
            day: string;
        };
        password: string;
        confirmPassword: string;
    }>,
    handleConfirm: (e?: BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>,
}

export function Signup(props: PropsType) {

    const {
        errMessage,
        yearCoomboList,
        back,
        isLoading,
        register,
        errors,
        handleConfirm,
        watch,
    } = { ...props };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
                    <Spinner size={40} />
                </div>
            )}
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 sm:p-10">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
                    アカウント作成
                </h1>
                {errMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4 mb-6">
                        {errMessage}
                    </div>
                )}
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ユーザー名（3〜30文字）
                        </label>
                        <Textbox
                            className={`w-full h-12 px-4 rounded-lg border-gray-300 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="text"
                            maxLength={30}
                            placeholder="UserName"
                            autoComplete="off"
                            registration={register("name")}
                        />
                        {errors.name?.message && (
                            <p className="text-red-500 text-xs mt-2">{errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            生年月日
                        </label>
                        <div className="flex items-center gap-2">
                            <Select
                                options={yearCoomboList}
                                className="flex-1 h-12 px-3 rounded-lg border-gray-300"
                                registration={register("birthday.year")}
                            />
                            <span className="text-gray-600 shrink-0">年</span>
                            <Select
                                options={MONTH_LIST}
                                className="flex-1 h-12 px-3 rounded-lg border-gray-300"
                                registration={register("birthday.month")}
                            />
                            <span className="text-gray-600 shrink-0">月</span>
                            <Select
                                options={getDayList(watch('birthday.year'), watch('birthday.month'))}
                                className="flex-1 h-12 px-3 rounded-lg border-gray-300"
                                registration={register("birthday.day")}
                            />
                            <span className="text-gray-600 shrink-0">日</span>
                        </div>
                        {errors.birthday?.message && (
                            <p className="text-red-500 text-xs mt-2">{errors.birthday.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <Textbox
                            className={`w-full h-12 px-4 rounded-lg border-gray-300 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="password"
                            maxLength={30}
                            autoComplete="off"
                            registration={register("password")}
                        />
                        {errors.password?.message && (
                            <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            確認用パスワード
                        </label>
                        <Textbox
                            className={`w-full h-12 px-4 rounded-lg border-gray-300 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                            type="password"
                            maxLength={30}
                            autoComplete="off"
                            registration={register("confirmPassword")}
                        />
                        {errors.confirmPassword?.message && (
                            <p className="text-red-500 text-xs mt-2">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            type="button"
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                            onClick={back}
                        >
                            戻る
                        </button>
                        <button
                            type="button"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            onClick={handleConfirm}
                        >
                            登録
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}